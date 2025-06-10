
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VideoRecording from './VideoCapture';
import TrustResults from './TrustResults';
import TrainingDashboard from './TrainingDashboard';
import { authService } from '@/utils/auth';
import { EmotionData } from '@/utils/emotionAnalysis';

interface AnalysisResult {
  trustPercentage: number;
  emotions: EmotionData;
  frames: string[];
}

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('analyze');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const currentUser = authService.getCurrentUser();

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setActiveTab('results');
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setActiveTab('analyze');
  };

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Sistema de Detección de Emociones</h1>
              <p className="text-muted-foreground">
                Bienvenido, {currentUser?.name || currentUser?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">Análisis</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>
              Resultados
            </TabsTrigger>
            <TabsTrigger value="training">Entrenamiento</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6 mt-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Análisis de Confiabilidad</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Utiliza tu cámara para realizar un análisis de 15 segundos que determine 
                el nivel de confiabilidad basado en expresiones faciales y emociones.
              </p>
            </div>
            
            <VideoRecording onAnalysisComplete={handleAnalysisComplete} />
            
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Instrucciones para el Análisis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Antes de comenzar:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Asegúrate de estar en un lugar bien iluminado</li>
                      <li>• Posiciona tu rostro en el centro de la cámara</li>
                      <li>• Mantén una distancia apropiada (60-80 cm)</li>
                      <li>• Evita movimientos bruscos durante la grabación</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Durante el análisis:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Mantén una expresión natural y relajada</li>
                      <li>• Mira directamente a la cámara</li>
                      <li>• Permite que el sistema capture diferentes microexpresiones</li>
                      <li>• La grabación se detendrá automáticamente a los 15 segundos</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6 mt-6">
            {analysisResult ? (
              <TrustResults
                trustPercentage={analysisResult.trustPercentage}
                emotions={analysisResult.emotions}
                frames={analysisResult.frames}
                onNewAnalysis={handleNewAnalysis}
              />
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">
                    No hay resultados disponibles. Realiza un análisis primero.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="training" className="space-y-6 mt-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Entrenamiento del Modelo</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Entrena tu propio modelo de machine learning subiendo imágenes etiquetadas 
                para mejorar la precisión del sistema de detección.
              </p>
            </div>
            
            <TrainingDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
