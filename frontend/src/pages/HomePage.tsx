import { PageContainer } from '@/components/ui/PageContainer'
import { TopBar } from '@/components/ui/TopBar'

export function HomePage() {
  return (
    <>
      <TopBar title="Home" />
      <PageContainer>
        <p className="text-sm text-[var(--text-tertiary)]">Welcome to StudyOS.</p>
      </PageContainer>
    </>
  )
}
