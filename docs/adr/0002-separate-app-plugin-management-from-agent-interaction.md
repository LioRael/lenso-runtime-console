# ADR-0002: Separate App Plugin management from Agent interaction

Status: Accepted

## Decision

Console manages Lenso Apps independently of whether they provide Agent interaction.
Plugin management uses an App management catalog; Agent conversations continue to
use the independent Agent catalog described in ADR-0001. Selecting a management
target does not select a conversational Agent or move its Sessions.

The Plugin workbench has three presentation scopes: App plugins, Console
extensions, and Management Agent. Each installed instance still has exactly one
management authority. Scopes do not define Plugin Contract types or grant access.
The same package can have independently configured instances in multiple targets.
Console extension management must not substitute the Management Agent inventory
when the Console authority is absent. A connected Console extension authority is
explicit configuration, not inferred from a package name or a shared process.

Console exposes `/api/console/v1/apps` and target-qualified Plugin control routes.
Existing App Agent connections are projected into this catalog through their
existing HTTP adapter. Their IDs and detail URLs remain compatible. Agent IDs in
those legacy URLs are route parameter names, not an Agent requirement for Plugin
management. Agent interaction routes remain unchanged.

Explicit non-Agent connections use the Console Plugin control HTTP adapter under
`/api/lenso/v1` on their configured loopback origin. The adapter preserves the
existing inventory, configuration, publication, and operation payload contracts,
including their current `lenso.agent.*` schema identifiers. This is a versioned
compatibility projection, not a newly standardized framework Capability or a
claim that every Lenso Host already provides these endpoints. The receiving Host
owns validation, authorization, persistence, and Generation activation.

Only allowlisted Plugin operations pass through the new management proxy. No
conversation, Session, authentication-management, arbitrary path, browser
Authorization header, or browser Cookie is forwarded. Control tokens are obtained
from configured server environment variables and never appear in catalog DTOs.
A catalog entry is connection metadata, not evidence that a target is online.

## Consequences

- Non-Agent Apps can expose Plugin management without implementing Agent bootstrap.
- Console extensions and Management Agent plugins cannot silently share inventory.
- Existing Agent UI and Session ownership stay intact.
- Functional categories remain optional presentation filters below the scope Tabs.
- Existing Agent management tools remain available only for their Agent targets;
  generic App Tool bindings require a separate implementation. The UI does not
  offer Agent assistance for a target those tools cannot address.
- Universal Host discovery, external network origins, and a neutral replacement for
  the legacy payload schemas are not introduced by this change.
