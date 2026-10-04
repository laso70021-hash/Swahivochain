# Security Specification: Logistics Chain User-Isolated Firestore Rules

## 1. Data Invariants

1. **Strict User Isolation (Zero Cross-Tenant Leakage)**:
   - Every user document `/users/{userId}` can ONLY be read or written by the user whose authenticated UID strictly matches `{userId}` (`request.auth != null && request.auth.uid == userId`).
   - Anonymous or unauthenticated users cannot read or write any user records or logistics data.
   - User A can NEVER view or mutate User B's profile, contact details, or credentials.

2. **Hierarchical Subcollection Ownership**:
   - Subcollections `/users/{userId}/shipments/{shipmentId}`, `/users/{userId}/pickups/{pickupId}`, and `/users/{userId}/clients/{clientId}` inherit their ownership boundary directly from the path variable `{userId}`.
   - Read, create, update, and delete operations on these subcollections are strictly restricted to `request.auth.uid == userId`.
   - On document creation, any payload `userId` field must match `request.auth.uid`.

3. **Field Validation & Anti-Update Gaps**:
   - Incoming profiles must contain valid string fields with bounded lengths.
   - Shipments must include valid tracking numbers, destinations, origins, statuses, and transport modes.
   - Document IDs must conform to alphanumeric/hyphen identifiers (`^[a-zA-Z0-9_\-]+$`) with bounded length to prevent path injection or denial-of-wallet payload attacks.

---

## 2. The "Dirty Dozen" Threat Payloads

1. **Unauthenticated Read on Profile**: An unauthenticated request tries to `get /users/usr_victim_123`.
   - Expected Result: `PERMISSION_DENIED`
2. **Cross-User Profile Hijack**: User `usr_attacker` tries to `update /users/usr_victim_123` setting `email: "hacked@evil.com"`.
   - Expected Result: `PERMISSION_DENIED`
3. **Cross-Tenant Shipment Snooping**: User `usr_attacker` tries to `get /users/usr_victim_123/shipments/SWL-001`.
   - Expected Result: `PERMISSION_DENIED`
4. **Foreign Shipment Injection**: User `usr_attacker` tries to `create /users/usr_victim_123/shipments/SWL-FAKE` with rogue cargo records.
   - Expected Result: `PERMISSION_DENIED`
5. **Shipment Spoofing with Mismatched UID**: User `usr_123` tries to create `/users/usr_123/shipments/SWL-999` with `data.userId: "usr_other"`.
   - Expected Result: `PERMISSION_DENIED`
6. **Malicious Document ID Injection**: An attacker submits a 2KB garbage string as `{shipmentId}` (`/users/usr_123/shipments/$$$INVALID_INJECT_LONG_STRING$$$`).
   - Expected Result: `PERMISSION_DENIED`
7. **Unauthenticated Pickup List Request**: An unauthenticated bot queries `/users/usr_123/pickups`.
   - Expected Result: `PERMISSION_DENIED`
8. **Cross-User Pickup Cancellation/Tampering**: User `usr_2` attempts to delete or update `/users/usr_1/pickups/p_999`.
   - Expected Result: `PERMISSION_DENIED`
9. **Address Book Exfiltration**: User `usr_competitor` queries `/users/usr_victim_123/clients` to steal corporate customer contact lists.
   - Expected Result: `PERMISSION_DENIED`
10. **Shadow Field Injection**: Attempt to create a user profile with unexpected admin escalation flags (e.g., `isAdmin: true` or `bypassBilling: true`).
    - Expected Result: `PERMISSION_DENIED`
11. **PII Public Scraping**: Scraping `/users` root without authentication.
    - Expected Result: `PERMISSION_DENIED`
12. **Negative Weight / Broken Type Attack**: An attacker writes a shipment with `weight: 9999999` as a raw array or malformed object.
    - Expected Result: `PERMISSION_DENIED`

---

## 3. Test Runner Design

The rules are validated through strict path matching and zero-trust attribute checks ensuring all dirty dozen exploits trigger immediate security denial.
