import React from 'react';
import ShipperLayout from './ShipperLayout';
import ShipperSidebar from './ShipperSidebar';
import { Head } from '@inertiajs/react';
import ShipperOrders from './ShipperOrders';

const Dashboard = () => {
  return (
    <>
      <Head title="Bảng điều khiển Shipper" />
      
      <ShipperLayout>
        <ShipperSidebar>
          <ShipperOrders />
        </ShipperSidebar>
      </ShipperLayout>
    </>
  );
};

export default Dashboard;