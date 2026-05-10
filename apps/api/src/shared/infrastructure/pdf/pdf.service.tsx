import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';
import { Injectable } from '@nestjs/common';
import { PsychProfileData } from '@/modules/tests/domain/interfaces/psych-profile-data.interface';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#111827', fontWeight: 'bold' },
  section: { margin: 10, padding: 15, backgroundColor: '#f3f4f6', borderRadius: 8 },
  title: { fontSize: 16, marginBottom: 10, color: '#374151', fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginBottom: 8, color: '#1f2937', fontWeight: 'bold' },
  text: { fontSize: 11, marginBottom: 5, color: '#4b5563', lineHeight: 1.5 },
  score: { fontSize: 18, color: '#10b981', fontWeight: 'bold' },
  summary: { fontSize: 12, fontStyle: 'italic', color: '#374151', padding: 10, backgroundColor: '#ecfdf5', borderRadius: 4, marginBottom: 15 },
  bullet: { fontSize: 10, marginLeft: 15, marginBottom: 3, color: '#4b5563' },
});

const ProfileDocument = ({ data }: { data: PsychProfileData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Mapa Comportamental</Text>

      <View style={styles.section}>
        <Text style={styles.title}>Candidato: {data.candidateName}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>DISC</Text>
        <Text style={styles.text}>Perfil Dominante: {data.discDominant}</Text>
        {data.discSecondary && <Text style={styles.text}>Perfil Secundário: {data.discSecondary}</Text>}
        <Text style={styles.text}>D (Dominância): {data.discD}%</Text>
        <Text style={styles.text}>I (Influência): {data.discI}%</Text>
        <Text style={styles.text}>S (Estabilidade): {data.discS}%</Text>
        <Text style={styles.text}>C (Conformidade): {data.discC}%</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Eneagrama</Text>
        <Text style={styles.text}>Tipo: {data.enneagramType}</Text>
        {data.enneagramWing && <Text style={styles.text}>Asa: {data.enneagramWing}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>16 Personalidades (MBTI)</Text>
        <Text style={styles.text}>Tipo: {data.mbtiType}</Text>
      </View>
    </Page>
  </Document>
);

const MatchReportDocument = ({ candidateName, analysis }: { candidateName: string, analysis: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Relatório de Match IA</Text>

      <View style={styles.section}>
        <Text style={styles.title}>Candidato: {candidateName || 'Não informado'}</Text>
        <Text style={styles.score}>Score Geral: {analysis?.overallScore ?? 0}%</Text>
        <Text style={styles.text}>Recomendação: {analysis?.recommendation || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Resumo Executivo</Text>
        <Text style={styles.summary}>"{analysis?.summary || 'Sem resumo disponível.'}"</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Dimensões de Avaliação</Text>
        <Text style={styles.text}>Alinhamento com Vaga: {analysis?.jobMatch?.score ?? 0}%</Text>
        <Text style={styles.bullet}>{analysis?.jobMatch?.rationale || ''}</Text>
        
        <Text style={styles.text}>Match Cultural: {analysis?.cultureMatch?.score ?? 0}%</Text>
        <Text style={styles.bullet}>{analysis?.cultureMatch?.rationale || ''}</Text>
        
        <Text style={styles.text}>Match com Liderança: {analysis?.leaderMatch?.score ?? 0}%</Text>
        <Text style={styles.bullet}>{analysis?.leaderMatch?.rationale || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Pontos Fortes & Riscos</Text>
        <Text style={styles.text}>Pontos Fortes:</Text>
        {(analysis?.jobMatch?.strengths || []).map((s: string, i: number) => <Text key={i} style={styles.bullet}>• {s}</Text>)}
        
        <Text style={[styles.text, { marginTop: 10, color: '#ef4444' }]}>Riscos de Contratação:</Text>
        {(analysis?.jobMatch?.risks || []).map((r: string, i: number) => <Text key={i} style={styles.bullet}>• {r}</Text>)}
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Plano de Desenvolvimento</Text>
        {(analysis?.developmentPlan || []).map((d: string, i: number) => <Text key={i} style={styles.bullet}>{i+1}. {d}</Text>)}
      </View>
    </Page>
  </Document>
);

@Injectable()
export class PdfService {
  async generatePsychProfilePdf(data: PsychProfileData): Promise<Buffer> {
    const stream = await renderToStream(<ProfileDocument data={data} />);
    return this.streamToBuffer(stream);
  }

  async generateMatchReportPdf(candidateName: string, analysis: any): Promise<Buffer> {
    const stream = await renderToStream(<MatchReportDocument candidateName={candidateName} analysis={analysis} />);
    return this.streamToBuffer(stream);
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
