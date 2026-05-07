import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';
import { Injectable } from '@nestjs/common';
import { PsychProfileData } from '@/modules/tests/domain/interfaces/psych-profile-data.interface';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff', fontFamily: 'Helvetica' },
  header: { fontSize: 24, marginBottom: 20, textAlign: 'center', color: '#111827' },
  section: { margin: 10, padding: 15, backgroundColor: '#f3f4f6', borderRadius: 8 },
  title: { fontSize: 16, marginBottom: 10, color: '#374151', fontWeight: 'bold' },
  text: { fontSize: 12, marginBottom: 5, color: '#4b5563', lineHeight: 1.5 },
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
        <Text style={styles.text}>D (Dominância): {data.discD.toFixed(1)}%</Text>
        <Text style={styles.text}>I (Influência): {data.discI.toFixed(1)}%</Text>
        <Text style={styles.text}>S (Estabilidade): {data.discS.toFixed(1)}%</Text>
        <Text style={styles.text}>C (Conformidade): {data.discS.toFixed(1)}%</Text>
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

@Injectable()
export class PdfService {
  async generatePsychProfilePdf(data: PsychProfileData): Promise<Buffer> {
    const stream = await renderToStream(<ProfileDocument data={data} />);

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
