import React from 'react';
import { clientApi } from '@/lib/api/clientApi';
import { IAddServiceForm } from '@/lib/types';

const BrowseServicesPage = async () => {
     try {
          const res: IAddServiceForm = await clientApi.get(`/services?status=Active`);
            console.log(res)} 
          catch (error) {
            console.error("Failed to fetch services:", error);
          }

         
    return (
        <div>
            
        </div>
    );
};

export default BrowseServicesPage;