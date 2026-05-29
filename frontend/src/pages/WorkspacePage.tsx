import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'

export function WorkspacePage() {
  return (
    <>
      <TopBar title="Workspace" />
      <PageContainer>
        <p className="text-sm text-[var(--text-tertiary)]">Workspace — coming soon.</p>
      </PageContainer>
    </>
  )
}
