import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'

export function StudyPage() {
  return (
    <>
      <TopBar title="Study" />
      <PageContainer>
        <p className="text-sm text-[var(--text-tertiary)]">Study sessions — coming soon.</p>
      </PageContainer>
    </>
  )
}
