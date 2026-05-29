import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'

export function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" />
      <PageContainer>
        <p className="text-sm text-[var(--text-tertiary)]">Settings — coming soon.</p>
      </PageContainer>
    </>
  )
}
