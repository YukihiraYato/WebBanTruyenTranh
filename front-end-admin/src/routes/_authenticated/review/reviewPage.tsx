import { createFileRoute } from '@tanstack/react-router'
import ReviewsPage from '@/features/review/ReviewsPage'

export const Route = createFileRoute('/_authenticated/review/reviewPage')({
  component: ReviewsPage,
})
