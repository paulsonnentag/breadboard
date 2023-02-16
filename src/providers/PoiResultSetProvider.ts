import { useEffect, useMemo, useState } from "react";
import { ForecastItem } from "../items/ForecastItem";
import { Item } from "../store";
import { PoiResultItem, PoiResultSetItem } from "../items/PoiResultItem";
import PlaceResult = google.maps.places.PlaceResult;
import { uuid } from "@automerge/automerge";
import LatLng = google.maps.LatLng;

interface LatLong {
  lat: number 
  long: number
}

let fetchedPlaces: {[latLong: string]: PoiResultSetItem | "loading"} = {}

export function usePoiResultSetProvider(paths: Item[][]) {
  const [values, setValues] = useState({} as { [id: string]: PoiResultSetItem })



  useEffect(() => {
    let toFetch: {[id: string]: LatLong} = {}

    for (var items of paths) {
      // Only supporting one location item and one weather view per path atm; can adjust in future.
      const locItem = items.find(i => i.type === "geolocation" && i.value)
      const poiResultSetItem = items.find(i => i.type === "poiResultSet")

      if (locItem && poiResultSetItem && !poiResultSetItem.value) {
        toFetch[poiResultSetItem.id] = locItem.value
      }
    }

    // TODO: Also cache dates and re-fetch a forecast after ~1 hour?

    for (var id in toFetch) {
      const latLong = toFetch[id]

      if (!latLong.lat || !latLong.long) {
        continue
      }

      const fetchedPlace = fetchedPlaces[`${latLong.lat}::${latLong.long}`]

      if (fetchedPlace) {
        if (fetchedPlace !== "loading") {
          setValues(poiResuls => ({
            ...poiResuls,
            [id]: fetchedPlace
          }))
        }
      } else {
        // Need to load
        fetchedPlaces[`${latLong.lat}::${latLong.long}`] = "loading"

        setValues(forecasts => ({
          ...forecasts,
          [id]: { results: undefined }
        }))

        getPoiResultsAt(latLong.lat, latLong.long).then((resultSet) => {
          setValues(forecasts => ({
            ...forecasts,
            [id]: resultSet
          }))
        })
      }
    }
  }, [Math.random()]) // this is really aweful but it works

  return values
}

const placesService =  new google.maps.places.PlacesService(document.createElement("div"))

const DISABLE_FETCH = true;

async function getPoiResultsAt (lat: number, lng: number): Promise<PoiResultSetItem> {

  if (DISABLE_FETCH) {
    return Promise.resolve({
      results: [{
        id: uuid(),
        name: "Wohnmobil-Stellplatz Bad Aachen",
        rating : 4.5,
        latLng: { lat, lng },
        photos: [],
        address: "Branderhofer Weg 11, 52066 Aachen, Germany",
        website : "http://www.aachen-camping.de/"
      }]
    })
  }

  return new Promise((resolve) => {
  placesService.nearbySearch(
    {
      location: new LatLng(lat, lng),
      radius: 50000,
      type: "campground",
    },
    async (results) => {
      if (!results) {
        return
      }

      const detailedResults = await Promise.all<PlaceResult | null>(
        results.map((result) => {
          const placeId = result.place_id

          if (!placeId) {
            return null
          }

          return new Promise((resolve) => {
            placesService.getDetails(
              {
                placeId: placeId,
                fields: [
                  "name",
                  "rating",
                  "photos",
                  "website",
                  "formatted_phone_number",
                  "formatted_address",
                  "geometry",
                ],
              },
              (result) => {
                resolve(result)
              }
            )
          })
        })
      )


      const pois: PoiResultItem[] = detailedResults.flatMap(
        (detailedResult: PlaceResult | null) => {
          if (!detailedResult) {
            return []
          }

          const {
            name,
            rating,
            photos,
            website,
            formatted_phone_number,
            formatted_address,
            geometry,
          } = detailedResult

          if (!name || !geometry?.location) {
            return []
          }

          console.log(detailedResult, formatted_address)

          const poi: PoiResultItem = {
            id: uuid(),
            latLng: geometry.location.toJSON(),
            name,
            photos: photos ? photos.map((photo) => photo.getUrl()) : [],
          }

          if (rating) {
            poi.rating = rating
          }

          if (formatted_phone_number) {
            poi.phoneNumber = formatted_phone_number
          }

          if (website) {
            poi.website = website
          }

          if (formatted_address) {
            poi.address = formatted_address
          }

          return [poi]
        }
      )

      resolve({ results: pois})
    })
  })
}
