export interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export interface Ticket {
    id: number;
    user_id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    category: string;
    created_at: string;
    sla_due?: string;
    tenant_name?: string;
    property_address?: string;
    property_risk_level?: string;
}

const API_Base = 'http://localhost:8000';

export async function fetchTickets(): Promise<Ticket[]> {
    const res = await fetch(`${API_Base}/tickets`);
    return res.json();
}

export async function updateTicketStatus(id: number, status: string): Promise<void> {
    const res = await fetch(`${API_Base}/tickets/${id}?status=${status}`, {
        method: 'PATCH',
    });
    if (!res.ok) throw new Error(`Failed to update status: ${res.statusText}`);
}

export async function createTicket(ticket: Omit<Ticket, 'id' | 'created_at'>): Promise<Ticket> {
    const res = await fetch(`${API_Base}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket)
    });
    if (!res.ok) throw new Error(`Failed to create ticket: ${res.statusText}`);
    return res.json();
}

export async function updateTicket(id: number, updates: Partial<Ticket>): Promise<Ticket> {
    const res = await fetch(`${API_Base}/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`Failed to update ticket: ${res.statusText}`);
    return res.json();
}

export async function deleteTicket(id: number): Promise<void> {
    const res = await fetch(`${API_Base}/tickets/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete ticket: ${res.statusText}`);
}

export interface Property {
    id: number;
    address: string;
    tenant_name: string;
    status: string;
    risk_level: string;
    last_updated: string;
}

export interface PropertySensorData {
    property_id: number;
    address: string;
    tenant_name: string;
    risk_level: string;
    sensors: any[];
}

export interface StatusResponse {
    status: string;
    properties: PropertySensorData[];
    risk_level: string;
}

export async function fetchStatus(): Promise<StatusResponse> {
    const res = await fetch(`${API_Base}/status`);
    return res.json();
}

export async function fetchProperties(): Promise<Property[]> {
    const res = await fetch(`${API_Base}/properties`);
    return res.json();
}

export async function fetchUsers(): Promise<User[]> {
    const res = await fetch(`${API_Base}/users`);
    return res.json();
}

export async function deleteUser(id: number): Promise<void> {
    await fetch(`${API_Base}/users/${id}`, {
        method: 'DELETE',
    });
}
