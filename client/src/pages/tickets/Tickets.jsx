// client/src/pages/tickets/Tickets.jsx
import React, { useState, useEffect } from "react";
import { TicketTable } from "../../components/tickets/TicketTable.jsx";
import { TicketDetails } from "../../components/tickets/TicketDetails.jsx";
import { TicketForm } from "../../components/tickets/TicketForm.jsx";
import { useTickets } from "../../hooks/useTickets.js";
import { Button } from "../../components/common/Button.jsx";
import { Pagination } from "../../components/common/Pagination.jsx";
import { useAppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  Search,
  PlusCircle,
  Filter,
  RotateCw,
  Ticket as TicketIcon,
} from "lucide-react";

export function Tickets() {
  const {
    isCreateTicketOpen,
    setIsCreateTicketOpen,
    selectedTicketId,
    setSelectedTicketId,
    setQuickPayTicket,
    setIsQuickPayOpen,
  } = useAppContext();
  const { user } = useAuth();

  const [activeStatus, setActiveStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { tickets, pagination, isLoading, filter, setFilter, refetch } =
    useTickets({ page: 1, limit: 10 });

  // Handle auto-selected ticket from search or external link
  useEffect(() => {
    if (selectedTicketId && tickets.length > 0) {
      const match = tickets.find(
        (t) => t.id === selectedTicketId || t.ticketNumber === selectedTicketId,
      );
      if (match) setSelectedTicket(match);
    }
  }, [selectedTicketId, tickets]);

  function handleStatusChange(status) {
    setActiveStatus(status);
    setFilter((prev) => ({ ...prev, status, page: 1 }));
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setFilter((prev) => ({ ...prev, search: searchInput.trim(), page: 1 }));
  }

  function handleResetFilters() {
    setActiveStatus("");
    setSearchInput("");
    setFilter({ page: 1, limit: 10 });
  }

  const statuses = [
    { id: "", label: "All Citations" },
    { id: "ISSUED", label: "Active / Issued" },
    { id: "OVERDUE", label: "Overdue / Delinquent" },
    { id: "PAID", label: "Paid in Full" },
    { id: "DISPUTED", label: "In Dispute" },
    { id: "VOID", label: "Voided / Dismissed" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Citations & Tickets
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Municipal infraction records, court disputes, and payment
            settlements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            title="Reload tickets"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            colorScheme="brand"
            onClick={() => setIsCreateTicketOpen(true)}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Issue New Citation
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => handleStatusChange(s.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeStatus === s.id
                  ? "bg-blue-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search & Reset */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-100"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by citation # (PKG-...), plate number, or violation title..."
              className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <Button size="sm" colorScheme="brand" type="submit">
              Search
            </Button>
            {(activeStatus || searchInput) && (
              <Button
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={handleResetFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Ticket DataTable */}
      <TicketTable
        tickets={tickets}
        isLoading={isLoading}
        onSelectTicket={(t) => setSelectedTicket(t)}
        onQuickPay={(t) => {
          setQuickPayTicket(t);
          setIsQuickPayOpen(true);
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

      {/* Details Modal */}
      <TicketDetails
        ticket={selectedTicket}
        isOpen={!!selectedTicket}
        onClose={() => {
          setSelectedTicket(null);
          setSelectedTicketId(null);
        }}
        onTicketUpdated={(updated) => {
          setSelectedTicket(updated);
          refetch();
        }}
      />

      {/* Create Ticket Modal */}
      <TicketForm
        isOpen={isCreateTicketOpen}
        onClose={() => setIsCreateTicketOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

export default Tickets;
