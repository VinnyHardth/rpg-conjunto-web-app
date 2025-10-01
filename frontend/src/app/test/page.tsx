// pages/index.tsx (ou qualquer outra página Next.js)
import StatusCard from '@/components/StatusCard'

const HomePage = () => {
  return (
   <div
  style={{
    padding: 50,
    backgroundColor: '#1e1e24',
    minHeight: '100vh',
    display: 'flex',          // garante flex
    flexDirection: 'row',     // coloca lado a lado
    alignItems: 'flex-start', // alinha pelo topo
    justifyContent: 'center', // centraliza horizontal
    gap: 20,                  // espaçamento entre cards
  }}
>
  <StatusCard
    hpCurrent={9999}
    hpMax={100}
    mpCurrent={60}
    mpMax={100}
    tpCurrent={90}
    tpMax={100}
    avatarUrl="/image_5429f0.png"
  />

  <StatusCard
    hpCurrent={75}
    hpMax={100}
    mpCurrent={30}
    mpMax={100}
    tpCurrent={40}
    tpMax={100}
    avatarUrl="/image_5429f0.png"
  />

  <StatusCard
    hpCurrent={20}
    hpMax={100}
    mpCurrent={80}
    mpMax={100}
    tpCurrent={100}
    tpMax={100}
    avatarUrl="/image_5429f0.png"
  />
</div>

  );
};
export default HomePage;