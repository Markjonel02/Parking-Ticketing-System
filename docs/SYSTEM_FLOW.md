# System Workflow & Citation Lifecycle

```
[Field Officer] ---> Detects Infraction ---> Scans/Enters Plate ---> Selects Violation & Zone
                                                                           |
                                                                           v
[Automated Rules Engine] <--- Calculates Fine & Grace Period <--- Issues Citation [PKG-YYYY-XXXXX]
         |
         +----------------------------+-------------------------------+
         |                            |                               |
         v                            v                               v
   [Online Portal]             [Field Reminder]              [Payment Counter]
   Citizen searches            Overdue batch job             Cashier receives tender
   by Plate/Ticket Number      assesses late fee             Issues receipt & marks PAID
         |
         +--> Pays fine via Card / Portal ---> Status: PAID
         |
         +--> Files Dispute ---> Status: DISPUTED ---> [Supervisor Adjudication]
                                                              |
                                                              +--> Dismissed / VOID
                                                              +--> Reduced Fine
                                                              +--> Upheld / ISSUED
```
