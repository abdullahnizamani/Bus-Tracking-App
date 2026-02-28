import { BusLocation } from "@/types";
import database from "@react-native-firebase/database";



const updateBusLocation = async (   
    busId: number,
    location: BusLocation): Promise<void> => {
  try {
    const reference = database().ref(`buses/bus_${busId}/location`);
    await reference.set(location)
  } catch (error) {
    console.error("Error updating bus location:", error);
    throw error;
  }
}


const getBusLocation = async (busId: number): Promise<BusLocation | null>=> {
  try {
    const snapshot = await database().ref(`buses/bus_${busId}/location`).once('value');
    
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error getting bus location:", error);
    return null;
  }
}



// --- Bus Active Status ---

const setBusActiveStatus = async(
  busId: number,
  isActive: boolean
): Promise<void>=> {
  try {
    const reference = database().ref(`buses/bus_${busId}/status`);
    await reference.set({
      isActive,
      lastUpdated: Date.now(),
    });

  } catch (error) {
    console.error("Error updating bus status:", error);
    throw error;
  }
}

// -- Driver info ------
const setBusDriver = async (
  busId: number,
  driver: { id: number; name: string }
): Promise<void> => {
  try {
    const reference = database().ref(`buses/bus_${busId}/driver`);
    await reference.set({
      id: driver.id,
      name: driver.name,
    });
  } catch (error) {
    console.error("Error setting bus driver:", error);
    throw error;
  }
}


// ------------------------
const getBusActiveStatus = async(
  busId: number
): Promise<{ isActive: boolean; lastUpdated: number } | null>=> {
  try {
    const snapshot = await database().ref(`buses/bus_${busId}/status`).once('value');
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error("Error getting bus status:", error);
    return null;
  }
}



const createLocationListener = (
  busId: number,
  onLocation: (location: BusLocation | null) => void
): () => void => {
const locationRef = database().ref(`buses/bus_${busId}/location`);
const callback = (snapshot: any) => {
    onLocation(snapshot.val());
  };

locationRef.on('value', callback);
  // Return unsubscribe function
return () => locationRef.off('value', callback);
}




const createStatusListener =(
  busId: number,
  onStatus: (status: { isActive: boolean; lastUpdated: number } | null) => void
): () => void =>{
const statusRef = database().ref(`buses/bus_${busId}/status`);

  const callback = (snapshot: any) => {
    onStatus(snapshot.val());
  };

statusRef.on('value', callback);

  // Return unsubscribe function
return () => statusRef.off('value', callback);
}


export {updateBusLocation, getBusLocation, setBusActiveStatus, setBusDriver, getBusActiveStatus, createLocationListener, createStatusListener}