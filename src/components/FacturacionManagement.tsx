import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FacturacionObraSocial } from './facturacion/FacturacionObraSocial';
import { FacturacionParticular } from './facturacion/FacturacionParticular';
import { LotesHistorial } from './facturacion/LotesHistorial';
import { FacturacionReports } from './facturacion/FacturacionReports';

const FacturacionManagement = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Facturación</h1>
        <p className="text-muted-foreground">Gestión de facturación por obra social y particulares</p>
      </div>

      <Tabs defaultValue="obras-sociales" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="obras-sociales">Facturación OS</TabsTrigger>
          <TabsTrigger value="particulares">Particulares</TabsTrigger>
          <TabsTrigger value="lotes">Lotes</TabsTrigger>
          <TabsTrigger value="reportes">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="obras-sociales">
          <FacturacionObraSocial />
        </TabsContent>
        <TabsContent value="particulares">
          <FacturacionParticular />
        </TabsContent>
        <TabsContent value="lotes">
          <LotesHistorial />
        </TabsContent>
        <TabsContent value="reportes">
          <FacturacionReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacturacionManagement;
