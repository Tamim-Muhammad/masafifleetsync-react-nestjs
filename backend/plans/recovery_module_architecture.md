# Recovery Incidents Module Architecture Plan

This document outlines the architecture and code structure for the `RecoveryIncidents` module in the NestJS backend, following the existing patterns (like `orders` and `fleet`).

## Files to Create

1. **DTOs**
   - [`backend/src/recovery/dto/create-recovery-incident.dto.ts`](backend/src/recovery/dto/create-recovery-incident.dto.ts): Defines validation rules for creating a recovery incident log (`driverId`, `latitude`, `longitude`, `description`).
   - [`backend/src/recovery/dto/update-recovery-incident-status.dto.ts`](backend/src/recovery/dto/update-recovery-incident-status.dto.ts): Defines validation rules for updating incident status (`status` with `@IsIn(['Open', 'In_Progress', 'Resolved', 'Closed'])`).

2. **Service**
   - [`backend/src/recovery/recovery.service.ts`](backend/src/recovery/recovery.service.ts): Handles business logic and database operations using the global `PrismaService`.
     - `create(dto: CreateRecoveryIncidentDto)`
     - `findAll()`
     - `findOne(id: string)`
     - `updateStatus(id: string, dto: UpdateRecoveryIncidentStatusDto)`

3. **Controller**
   - [`backend/src/recovery/recovery.controller.ts`](backend/src/recovery/recovery.controller.ts): Exposes the HTTP endpoints under `/recovery-incidents`.
     - `POST /recovery-incidents` (Create new recovery incident)
     - `GET /recovery-incidents` (Fetch all recovery incidents)
     - `PATCH /recovery-incidents/:id/status` (Update incident status)

4. **Module**
   - [`backend/src/recovery/recovery.module.ts`](backend/src/recovery/recovery.module.ts): NestJS module registration.

5. **App Module Integration**
   - Register `RecoveryModule` in [`backend/src/app.module.ts`](backend/src/app.module.ts).

## Mermaid Architecture Diagram

```mermaid
graph TD
    Client[HTTP Client / Frontend] -->|POST / PATCH / GET| Controller[RecoveryController]
    Controller --> Service[RecoveryService]
    Service --> Prisma[PrismaService (Global)]
    Prisma --> DB[(Database)]
```
