/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  CLIENT = 'client',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface ServiceItem {
  id: string;
  category: 'Web Development' | 'Software Development';
  name: string;
  description: string;
  estimatedCost: number;
}

export interface Settings {
  companyName: string;
  services: ServiceItem[];
  minimumBudget: number;
  workingHours: string;
  aiPrompt: string;
}

export interface SessionMessage {
  sender: 'ai' | 'client';
  text: string;
  timestamp: string;
}

export interface Session {
  id: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed' | 'abandoned';
  messages: SessionMessage[];
}

export interface Report {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  summary: string;
  budget: string | number;
  timeline: string;
  recommendedService: string;
  leadScore: number;
  createdAt: string;
  meetingDate?: string;
}
