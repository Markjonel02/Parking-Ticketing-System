// client/src/pages/vehicles/Vehicles.jsx
import React, { useState, useEffect } from 'react';
import { VehicleTable } from '../../components/vehicles/VehicleTable.jsx';
import { VehicleDetails } from '../../components/vehicles/VehicleDetails.jsx';
import { VehicleForm } from '../../components/vehicles/VehicleForm.jsx';
import { useVehicles } from '../../hooks/useVehicles.js';
import { Button } from '../../components/common/Button.jsx';
import { Pagination } from '../../components/common/Pagination.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import { Car, Search, PlusCircle, RotateCw } from 'lucide-react';

export function Vehicles() {
  const {
    selectedVehiclePlate,
    setSelectedVehiclePlate,
    setIsCreateTicketOpen
  } = useAppContext();

  const [searchInput, setSearchInput] = useState('');
  const [selectedPlate, setSelectedPlate] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const {
    vehicles,
    pagination,
    isLoading,
    setFilter,
    refetch
  } = useVehicles({ page: 1, limit: 10 });

  useEffect(() => {
    if (selectedVehiclePlate) {
      setSelectedPlate(selectedVehiclePlate);
    }
  }, [selectedVehiclePlate]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setFilter((prev) => ({ ...prev, search: searchInput.trim(), page: 1 }));
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            Vehicle Master Registry
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-indexed DMV vehicle registrations, plate lookups, and citation history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Reload vehicles"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            colorScheme="brand"
            onClick={() => setIsRegisterOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Register Vehicle
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by license plate (e.g. 7XYZ890), owner name, or make..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button size="sm" colorScheme="brand" type="submit">
          Search Registry
        </Button>
      </form>

      {/* Vehicles Table */}
      <VehicleTable
        vehicles={vehicles}
        isLoading={isLoading}
        onSelectVehicle={(v) => setSelectedPlate(v.plateNumber)}
        onIssueCitation={(v) => {
          setSelectedPlate(v.plateNumber);
          setIsCreateTicketOpen(true);
        }}
      />

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        pageSize={10}
        onPageChange={(page) => setFilter((prev) => ({ ...prev, page }))}
      />

      {/* Vehicle Details Modal */}
      <VehicleDetails
        plateNumber={selectedPlate}
        isOpen={!!selectedPlate}
        onClose={() => {
          setSelectedPlate(null);
          setSelectedVehiclePlate(null);
        }}
      />

      {/* Register Vehicle Modal */}
      <VehicleForm
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

export default Vehicles;
