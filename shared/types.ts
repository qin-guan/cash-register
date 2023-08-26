import type { TRPCClientError as __TRPCClientError } from '@trpc/client'
import type { AppRouter } from '~/server/trpc/modules'

export type TRPCClientError = __TRPCClientError<AppRouter>
