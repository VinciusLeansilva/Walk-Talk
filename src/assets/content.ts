import {
  Mic,
  Cpu,
  RadioTower,
  Satellite,
  Globe2,
  AudioLines,
  ShieldCheck,
  Mountain,
  Radio,
} from "lucide-react";
export const steps = [
  {
    title: "Pressione e fale",
    short: "Uma ideia. Um botão. A sua voz pronta para ir mais longe.",
    detail:
      "Segure o botão Push To Talk (PTT) enquanto fala. Ao soltar, o aparelho encaminha sua mensagem. Nesta demonstração, nenhuma voz é gravada ou enviada.",
    icon: Mic,
    phase: "CAPTURA DE VOZ",
    location: "ORIGEM",
  },
  {
    title: "Sua voz vira dados",
    short: "O áudio é digitalizado e protegido para seguir viagem.",
    detail:
      "O aparelho converte o áudio em pacotes digitais e aplica a proteção da comunicação. Criptografia e codecs reais dependem das especificações do equipamento e da rede.",
    icon: Cpu,
    phase: "PROCESSAMENTO",
    location: "ORIGEM",
  },
  {
    title: "Próxima parada: órbita",
    short: "Ondas de rádio levam a mensagem ao satélite.",
    detail:
      "A antena transmite os dados para a rede de satélites disponível. Uma visão desobstruída do céu favorece a conexão em montanhas, florestas, mar e desertos.",
    icon: RadioTower,
    phase: "UPLINK",
    location: "TERRA → ESPAÇO",
  },
  {
    title: "Sinal recebido",
    short: "O satélite recebe o sinal e a rede identifica o destino.",
    detail:
      "A rede recebe e processa o sinal, decodifica os dados necessários e identifica o destinatário. A divisão dessas funções entre satélite e infraestrutura terrestre varia por sistema.",
    icon: Satellite,
    phase: "RECEPÇÃO ORBITAL",
    location: "EM ÓRBITA",
  },
  {
    title: "Distâncias se conectam",
    short: "A mensagem cruza fronteiras até encontrar seu destino.",
    detail:
      "O roteamento encaminha os pacotes ao outro aparelho, inclusive entre países e continentes. A rota ilustrada simplifica possíveis enlaces entre satélites e estações terrestres.",
    icon: Globe2,
    phase: "ROTEAMENTO GLOBAL",
    location: "ESPAÇO → TERRA",
  },
  {
    title: "A sua voz, do outro lado",
    short: "Os dados voltam a ser áudio. A conversa continua.",
    detail:
      "O aparelho compatível reconstrói o áudio e reproduz a voz. A comunicação é percebida em tempo real, mas a latência efetiva depende da rede e das condições de uso.",
    icon: AudioLines,
    phase: "MENSAGEM RECEBIDA",
    location: "DESTINO",
  },
];
export const benefits = [
  {
    icon: Globe2,
    title: "O mundo é o alcance.",
    label: "Cobertura global",
    description:
      "Conexões que atravessam países e continentes pela rede de satélites. A disponibilidade real depende da operadora e das autorizações locais.",
  },
  {
    icon: Radio,
    title: "Aperte. Fale. Conecte.",
    label: "De aparelho para aparelho",
    description:
      "Converse com quem tem um aparelho WALK TALK compatível e habilitado na mesma rede. Uma experiência direta, feita para manter sua equipe por perto.",
  },
  {
    icon: Mountain,
    title: "Além do sinal de celular.",
    label: "Liberdade para explorar",
    description:
      "Montanhas, florestas, mar ou deserto: a comunicação usa a rede satelital. Obstáculos e condições do ambiente podem afetar a recepção.",
  },
  {
    icon: ShieldCheck,
    title: "Confiança em cada palavra.",
    label: "Seguro e confiável",
    description:
      "Processamento digital e proteção da comunicação fazem parte do conceito. Confirme protocolos, certificações e requisitos no equipamento comercial.",
  },
];
export const cities = [
  { name: "São Paulo", country: "Brasil", lat: -23.55, lng: -46.63 },
  { name: "Lisboa", country: "Portugal", lat: 38.72, lng: -9.14 },
  { name: "Nova York", country: "Estados Unidos", lat: 40.71, lng: -74.01 },
  { name: "Tóquio", country: "Japão", lat: 35.68, lng: 139.69 },
  { name: "Cidade do Cabo", country: "África do Sul", lat: -33.92, lng: 18.42 },
  { name: "Sydney", country: "Austrália", lat: -33.87, lng: 151.21 },
];
