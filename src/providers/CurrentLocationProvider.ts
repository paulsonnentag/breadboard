import { useEffect, useState, useCallback } from "react";
import { DateItem } from "../items/DateItem";
import { ForecastItem } from "../items/ForecastItem";
import { LocationItem } from "../items/LocationItem";
import { Item } from "../store";
import LatLngLiteral = google.maps.LatLngLiteral;

const IS_OVERRIDE_ENABLED = true

export function useCurrentLocationProvider(paths: Item[][]) {
  let geolocation = useGeolocation()

  let values: { [id: string]: LocationItem } = {}

  if (!geolocation || !geolocation.latitude || !geolocation.longitude || IS_OVERRIDE_ENABLED) {
    // During dev, the browser stops giving the location after many refreshes; giving Denver here
    geolocation = {
      latitude: 43.790428,
      longitude: -110.681763
    }
  }

  if (geolocation && geolocation.latitude && geolocation.longitude) {
    const value: LocationItem = {
      lat: geolocation.latitude,
      long: geolocation.longitude,
      title: "Current location"
    }

    for (var items of paths) {
      for (var item of items) {
        if (item.type === "geolocation" && !item.value) {
          values[item.id] = value
        }
      }
    }
  }

  return values
}


// From https://github.com/bence-toth/react-hook-geolocation/blob/main/src/index.js
// TODO: Need to add types
const useGeolocation = (
  { enableHighAccuracy, maximumAge, timeout } = {},
  callback,
  isEnabled = true
) => {
  const [coordinates, setCoordinates] = useState({
    accuracy: null,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    latitude: null,
    longitude: null,
    speed: null,
    timestamp: null,
    error: null,
  });

  const updateCoordinates = useCallback(
    ({ coords, timestamp }) => {
      const {
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        latitude,
        longitude,
        speed,
      } = coords;

      setCoordinates({
        accuracy,
        altitude,
        altitudeAccuracy,
        heading,
        latitude,
        longitude,
        speed,
        timestamp,
        error: null,
      });

      if (typeof callback === "function") {
        callback({
          accuracy,
          altitude,
          altitudeAccuracy,
          heading,
          latitude,
          longitude,
          speed,
          timestamp,
          error: null,
        });
      }
    },
    [callback]
  );

  const setError = useCallback((error:any) => {
    setCoordinates({
      accuracy: null,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude: null,
      longitude: null,
      speed: null,
      timestamp: null,
      error,
    });
  }, []);

  useEffect(() => {
    let watchId: number;

    if (isEnabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(updateCoordinates, setError);
      watchId = navigator.geolocation.watchPosition(
        updateCoordinates,
        setError,
        {
          enableHighAccuracy,
          maximumAge,
          timeout,
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [
    isEnabled,
    callback,
    enableHighAccuracy,
    maximumAge,
    setError,
    timeout,
    updateCoordinates,
  ]);

  return coordinates;
};
