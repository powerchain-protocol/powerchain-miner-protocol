# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24.19.0-bookworm-slim
ARG PNPM_VERSION=11.23.0

FROM ${NODE_IMAGE} AS base
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable \
    && corepack prepare "pnpm@${PNPM_VERSION}" --activate \
    && pnpm --version
WORKDIR /workspace

FROM base AS dependencies
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    else \
      echo '[docker] pnpm-lock.yaml missing; resolving dependencies without a frozen lockfile' >&2; \
      pnpm install --no-frozen-lockfile; \
    fi

FROM dependencies AS build
RUN pnpm typecheck \
    && pnpm api:typecheck \
    && pnpm build:web

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /workspace
COPY --from=build --chown=node:node /workspace /workspace
USER node
CMD ["node", "--version"]
