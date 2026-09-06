# Release Process

`LioRael/lenso-console` owns its Console application and service. It
does not use a repository-wide release plan, shadow registry, central publisher,
release nonce, or cross-repository receipt channel.

## Versioning

Create a changeset for every user-facing Console change:

```sh
pnpm changeset
```

The Changesets workflow opens or updates a version pull request for the private
`@lenso/console-web` application. There is no Console-owned public npm package
or npm publication step. Historical package versions and tags remain historical
records; the application version identifies the source release. The former OCI pipeline
was retired; versioning does not publish a container image.

## Distribution boundary

Merge the reviewed Changesets version PR after its quality checks pass. The
repository currently distributes Console from source using the documented
`pnpm agent:web` launcher and separately released Agent Web binaries.

There is no active OCI build or publication workflow. A Changesets version bump
does not create an immutable image, GitHub binary release, or npm publication.
Do not claim an image digest or restore the retired pipeline as part of routine
versioning. A future binary or container distribution needs its own reviewed
packaging and installation workflow.

## Local checks

```sh
pnpm install --frozen-lockfile
pnpm changeset status --output /tmp/lenso-console-changesets.json
pnpm format:check
pnpm lint
pnpm build
pnpm test
```

`pnpm build` includes TypeScript validation. `pnpm test` runs both the local
Vitest suite and the browser suite.
