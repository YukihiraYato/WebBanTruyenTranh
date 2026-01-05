import { createFileRoute } from '@tanstack/react-router'
import CreateImportPage from '@/features/import-product/CreateImportPage';
export const Route = createFileRoute('/_authenticated/import/create')({
  component: CreateImportPage,
})

