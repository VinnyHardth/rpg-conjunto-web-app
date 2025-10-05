import StatusCard from '@/components/StatusCard'

const HomePage = () => {
  return (
    <div
      style={{
        padding: 10,
        backgroundColor: '#1e1e24',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',          // 👉 quebra de linha automática
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 10,
        height: '50vh',
      }}
    >
      <StatusCard
        hpCurrent={100}
        hpMax={100}
        mpCurrent={60}
        mpMax={100}
        tpCurrent={90}
        tpMax={100}
        avatarUrl="/assets/image.jpg"
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

      <StatusCard
        hpCurrent={90}
        hpMax={100}
        mpCurrent={50}
        mpMax={100}
        tpCurrent={70}
        tpMax={100}
        avatarUrl="/image_5429f0.png"
      />

      <StatusCard
        hpCurrent={100}
        hpMax={100}
        mpCurrent={60}
        mpMax={100}
        tpCurrent={90}
        tpMax={100}
        avatarUrl="/assets/image.jpg"
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
      </div>    

    
  );
};

export default HomePage;
