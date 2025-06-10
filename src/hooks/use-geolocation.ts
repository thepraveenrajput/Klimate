// import { useEffect, useState } from 'react';
// import type { Coordinates } from '@/api/types';

// interface GeolocationState {
//   coordinates: Coordinates | null;
//   error: string | null;
//   isLoading: boolean;
// }

// export function useGeoLocation(){
//   const [locationData, setLocationData] = useState<GeolocationState>({
//     coordinates: null,
//     error: null,
//     isLoading: true,
//   });

//   const getLocation =() =>{
//     setLocationData((prev) =>({...prev, isloading: true, error: null }));

//     if(!navigator.geolocation){
//       setLocationData({
//         coordinates: null,
//         error: 'Geolocation is not supported by this browser.',
//         isLoading: false,
//       });
//       return;
//     }
//     navigator.geolocation.getCurrentPosition((position)=>{
//       setLocationData({
//         coordinates: {
//           lat: position.coords.latitude,
//           lon: position.coords.longitude,
//         },
//         error: null,
//         isLoading: false,

//       })

//     },(error)=>{
//       let errorMessage : string;
//       switch(error.code){
//         case error.PERMISSION_DENIED:
//           errorMessage=
//           "Location permission denied. Please allow location access in your browser settings.";
//           break;
//         case error.POSITION_UNAVAILABLE:
//           errorMessage = "Location information is unavailable. Please try again later.";
//           break;
//         case error.TIMEOUT:
//           errorMessage = "The request to get user location timed out. Please try again.";
//           break;
        
//         default:
//           errorMessage = "An unknown error occurred while retrieving location.";
//       }
//       setLocationData({
//         coordinates: null,
//         error: errorMessage,
//         isLoading: false,
//       });
//   },{
//     enableHighAccuracy: true,
//     timeout: 5000, // 5 seconds
//     maximumAge: 0, // Do not use cached position
//   }
// );
// };   

//   useEffect(()=>{
//     getLocation();

//   },[])

//   return{
//     ...locationData,
//     getLocation,
//   };

// } 

import { useEffect, useState, useRef } from 'react';
import type { Coordinates } from '@/api/types';

interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
}

export function useGeoLocation(track = false) {
  const [locationData, setLocationData] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: true,
  });

  const watchIdRef = useRef<number | null>(null);

  const updateLocation = (position: GeolocationPosition) => {
    setLocationData({
      coordinates: {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      },
      error: null,
      isLoading: false,
    });
  };

  const handleError = (error: GeolocationPositionError) => {
    let errorMessage: string;
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please allow location access in your browser settings.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable. Please try again later.';
        break;
      case error.TIMEOUT:
        errorMessage = 'The request to get user location timed out. Please try again.';
        break;
      default:
        errorMessage = 'An unknown error occurred while retrieving location.';
    }

    setLocationData({
      coordinates: null,
      error: errorMessage,
      isLoading: false,
    });
  };

  const getLocation = () => {
    setLocationData((prev) => ({ ...prev, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      setLocationData({
        coordinates: null,
        error: 'Geolocation is not supported by this browser.',
        isLoading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(updateLocation, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationData({
        coordinates: null,
        error: 'Geolocation is not supported by this browser.',
        isLoading: false,
      });
      return;
    }

    if (track) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        updateLocation,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      getLocation();
    }

    return () => {
      // Cleanup on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [track]);

  return {
    ...locationData,
    getLocation,
  };
}
