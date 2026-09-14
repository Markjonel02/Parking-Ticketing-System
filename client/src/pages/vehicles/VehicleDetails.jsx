// client/src/pages/vehicles/VehicleDetails.jsx
import React from 'react';
import { VehicleDetails as VehicleDetailsModal } from '../../components/vehicles/VehicleDetails.jsx';
import { useAppContext } from '../../context/AppContext.jsx';

export function VehicleDetailsPage({ plate }) {
  const { selectedVehiclePlate, navigateTo } = useAppContext();
  const activePlate = plate || selectedVehiclePlate;

  return (
    <VehicleDetailsModal
      plateNumber={activePlate}
      isOpen={!!activePlate}
      onClose={() => navigateTo('vehicles')}
    />
  );
}

export default VehicleDetailsPage;
