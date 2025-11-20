import type { TemplateContent, SignatureField } from "@/types/template.types";

export interface DefaultTemplate {
  name: string;
  category: 'contrato' | 'proposta' | 'termo' | 'relatorio' | 'outro';
  content: TemplateContent;
  isDefault: boolean;
}

export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  // 1. CONTRATO DE PRESTAÇÃO DE SERVIÇOS
  {
    name: "Contrato de Prestação de Serviços de Arquitetura",
    category: "contrato",
    isDefault: true,
    content: {
      blocks: [
        {
          id: "1",
          type: "heading1",
          content: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE ARQUITETURA E INTERIORES",
        },
        {
          id: "2",
          type: "paragraph",
          content: "Pelo presente instrumento particular de prestação de serviços profissionais, de um lado:",
        },
        {
          id: "3",
          type: "heading2",
          content: "CONTRATANTE:",
        },
        {
          id: "4",
          type: "paragraph",
          content: "{{cliente.nome_completo}}, residente e domiciliado(a) em {{cliente.endereco}}, {{cliente.cidade}} - {{cliente.estado}}, inscrito(a) no CPF sob o nº {{cliente.cpf}}, portador(a) da Cédula de Identidade RG, telefone {{cliente.telefone}}, e-mail {{cliente.email}}, doravante denominado simplesmente CONTRATANTE.",
        },
        {
          id: "5",
          type: "heading2",
          content: "CONTRATADO:",
        },
        {
          id: "6",
          type: "paragraph",
          content: "{{empresa.nome}}, inscrita no CNPJ sob o nº {{empresa.cnpj}}, com sede em {{empresa.endereco}}, telefone {{empresa.telefone}}, representada neste ato por seu(sua) responsável técnico(a) {{empresa.responsavel_tecnico}}, doravante denominado simplesmente CONTRATADO.",
        },
        {
          id: "7",
          type: "heading2",
          content: "DO OBJETO DO CONTRATO:",
        },
        {
          id: "8",
          type: "paragraph",
          content: "O presente contrato tem como objeto a prestação de serviços profissionais de arquitetura e design de interiores referente ao projeto denominado \"{{projeto.nome}}\", tipo {{projeto.tipo}}, localizado em {{projeto.endereco}}.",
        },
        {
          id: "9",
          type: "paragraph",
          content: "Descrição do projeto: {{projeto.descricao}}",
        },
        {
          id: "10",
          type: "heading2",
          content: "DO ESCOPO DOS SERVIÇOS:",
        },
        {
          id: "11",
          type: "paragraph",
          content: "Os serviços a serem prestados pelo CONTRATADO compreendem:",
        },
        {
          id: "12",
          type: "list",
          content: "Levantamento e análise das necessidades do cliente\nElaboração de estudo preliminar e conceito do projeto\nDesenvolvimento do anteprojeto com plantas, cortes e elevações\nElaboração de projeto executivo detalhado\nEspecificação de materiais e acabamentos\nDetalhamento de marcenaria e elementos especiais\nAcompanhamento técnico (conforme acordado)\nApoio na contratação e gerenciamento de fornecedores (opcional)",
        },
        {
          id: "13",
          type: "heading2",
          content: "DOS PRAZOS:",
        },
        {
          id: "14",
          type: "paragraph",
          content: "O CONTRATADO compromete-se a iniciar os trabalhos em {{projeto.data_inicio}} e concluir a entrega dos produtos contratados até {{projeto.data_conclusao}}, ressalvadas as hipóteses de atraso justificado por caso fortuito, força maior, ou por solicitação de alterações no escopo por parte do CONTRATANTE.",
        },
        {
          id: "15",
          type: "heading2",
          content: "DO VALOR E FORMA DE PAGAMENTO:",
        },
        {
          id: "16",
          type: "paragraph",
          content: "O valor total dos serviços ora contratados é de {{projeto.orcamento}}, a ser pago da seguinte forma:",
        },
        {
          id: "17",
          type: "list",
          content: "30% na assinatura do contrato\n40% na aprovação do anteprojeto\n30% na entrega final dos projetos executivos\nOs pagamentos deverão ser realizados via transferência bancária ou PIX",
        },
        {
          id: "18",
          type: "heading2",
          content: "DAS ALTERAÇÕES DE ESCOPO:",
        },
        {
          id: "19",
          type: "paragraph",
          content: "Quaisquer alterações no escopo dos serviços contratados deverão ser formalizadas por meio de aditivo ao presente contrato, podendo implicar em ajustes no cronograma e nos valores acordados. Revisões além das previstas no escopo original serão cobradas separadamente.",
        },
        {
          id: "20",
          type: "heading2",
          content: "DA PROPRIEDADE INTELECTUAL:",
        },
        {
          id: "21",
          type: "paragraph",
          content: "Os direitos autorais sobre os projetos desenvolvidos pertencem ao CONTRATADO, sendo concedida ao CONTRATANTE licença de uso exclusivamente para execução da obra objeto deste contrato. É vedada a reprodução, modificação ou utilização dos projetos para outros fins sem autorização expressa do CONTRATADO.",
        },
        {
          id: "22",
          type: "heading2",
          content: "DAS RESPONSABILIDADES:",
        },
        {
          id: "23",
          type: "paragraph",
          content: "O CONTRATADO responsabiliza-se pela qualidade técnica dos projetos desenvolvidos. O CONTRATANTE responsabiliza-se pela contratação e fiscalização dos profissionais que executarão a obra, bem como pela obtenção de licenças e aprovações junto aos órgãos competentes, quando aplicável.",
        },
        {
          id: "24",
          type: "heading2",
          content: "DA RESCISÃO:",
        },
        {
          id: "25",
          type: "paragraph",
          content: "O presente contrato poderá ser rescindido por qualquer das partes mediante comunicação por escrito com antecedência mínima de 15 (quinze) dias. Em caso de rescisão, o CONTRATANTE deverá quitar os serviços já executados proporcionalmente ao andamento dos trabalhos.",
        },
        {
          id: "26",
          type: "heading2",
          content: "DO FORO:",
        },
        {
          id: "27",
          type: "paragraph",
          content: "Fica eleito o foro da comarca de {{cliente.cidade}} para dirimir quaisquer dúvidas ou litígios decorrentes do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
        },
        {
          id: "28",
          type: "paragraph",
          content: "E por estarem assim justos e contratados, firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.",
        },
        {
          id: "29",
          type: "paragraph",
          content: "{{cliente.cidade}}, {{data.hoje}}",
        },
        {
          id: "30",
          type: "signature",
          content: "",
          signatureField: {
            id: "sig1",
            type: "cliente",
            label: "CONTRATANTE: {{cliente.nome_completo}}",
          },
        },
        {
          id: "31",
          type: "signature",
          content: "",
          signatureField: {
            id: "sig2",
            type: "responsavel",
            label: "CONTRATADO: {{empresa.nome}} - {{empresa.responsavel_tecnico}}",
          },
        },
      ],
    },
  },

  // 2. PROPOSTA COMERCIAL
  {
    name: "Proposta Comercial de Projeto",
    category: "proposta",
    isDefault: true,
    content: {
      blocks: [
        {
          id: "1",
          type: "heading1",
          content: "PROPOSTA COMERCIAL",
        },
        {
          id: "2",
          type: "paragraph",
          content: "{{empresa.nome}}\n{{empresa.endereco}}\n{{empresa.telefone}}",
        },
        {
          id: "3",
          type: "paragraph",
          content: "{{data.hoje}}",
        },
        {
          id: "4",
          type: "heading2",
          content: "Prezado(a) {{cliente.nome_completo}},",
        },
        {
          id: "5",
          type: "paragraph",
          content: "É com grande satisfação que apresentamos nossa proposta comercial para o desenvolvimento do projeto \"{{projeto.nome}}\", localizado em {{projeto.endereco}}.",
        },
        {
          id: "6",
          type: "paragraph",
          content: "Nosso escritório é especializado em projetos de {{projeto.tipo}}, aliando criatividade, funcionalidade e atenção aos detalhes para criar espaços únicos que refletem a personalidade e necessidades de nossos clientes.",
        },
        {
          id: "7",
          type: "heading2",
          content: "ESCOPO DE TRABALHO:",
        },
        {
          id: "8",
          type: "paragraph",
          content: "Descrição do projeto: {{projeto.descricao}}",
        },
        {
          id: "9",
          type: "heading3",
          content: "Etapas e Produtos a Serem Entregues:",
        },
        {
          id: "10",
          type: "list",
          content: "ESTUDO PRELIMINAR:\n- Reunião de briefing e levantamento de necessidades\n- Desenvolvimento de conceito e diretrizes de projeto\n- Apresentação de painel de referências (moodboard)\n- Planta de layout com distribuição de ambientes\n\nANTEPROJETO:\n- Plantas baixas humanizadas com layout de mobiliário\n- Cortes e elevações principais\n- Perspectivas 3D dos ambientes (até 5 imagens)\n- Paleta de materiais e acabamentos\n- Memorial descritivo básico\n\nPROJETO EXECUTIVO:\n- Plantas baixas técnicas detalhadas\n- Plantas de piso, forro e iluminação\n- Elevações de paredes com detalhamento\n- Projeto de marcenaria com vistas e detalhes\n- Detalhamentos técnicos especiais\n- Especificações completas de materiais\n- Planilha quantitativa de materiais\n\nACOMPANHAMENTO (Opcional):\n- Visitas técnicas à obra\n- Esclarecimento de dúvidas com fornecedores e executores\n- Apoio na escolha de materiais e acabamentos",
        },
        {
          id: "11",
          type: "heading2",
          content: "INVESTIMENTO:",
        },
        {
          id: "12",
          type: "paragraph",
          content: "Valor total do projeto: {{projeto.orcamento}}",
        },
        {
          id: "13",
          type: "heading3",
          content: "Condições de Pagamento:",
        },
        {
          id: "14",
          type: "list",
          content: "Entrada: 30% na aprovação da proposta\n2ª Parcela: 40% na aprovação do anteprojeto\n3ª Parcela: 30% na entrega do projeto executivo completo",
        },
        {
          id: "15",
          type: "heading2",
          content: "PRAZO DE EXECUÇÃO:",
        },
        {
          id: "16",
          type: "paragraph",
          content: "Início previsto: {{projeto.data_inicio}}\nPrevisão de conclusão: {{projeto.data_conclusao}}",
        },
        {
          id: "17",
          type: "paragraph",
          content: "* Os prazos poderão ser ajustados conforme a complexidade do projeto e aprovações do cliente em cada etapa.",
        },
        {
          id: "18",
          type: "heading2",
          content: "VALIDADE DA PROPOSTA:",
        },
        {
          id: "19",
          type: "paragraph",
          content: "Esta proposta tem validade de 15 (quinze) dias a partir da data de emissão.",
        },
        {
          id: "20",
          type: "heading2",
          content: "OBSERVAÇÕES IMPORTANTES:",
        },
        {
          id: "21",
          type: "list",
          content: "A execução da obra não está incluída nesta proposta\nAprovações legais junto a órgãos competentes são de responsabilidade do cliente\nAlterações de escopo após aprovação das etapas poderão gerar custos adicionais\nOs projetos são de propriedade intelectual do escritório, sendo concedida licença de uso ao cliente",
        },
        {
          id: "22",
          type: "paragraph",
          content: "Estamos à disposição para esclarecer qualquer dúvida e ansiosos para transformar seu projeto em realidade!",
        },
        {
          id: "23",
          type: "paragraph",
          content: "Atenciosamente,",
        },
        {
          id: "24",
          type: "paragraph",
          content: "{{empresa.nome}}\n{{empresa.responsavel_tecnico}}\n{{empresa.telefone}}",
        },
      ],
    },
  },

  // 3. RELATÓRIO TÉCNICO
  {
    name: "Relatório Técnico do Projeto",
    category: "relatorio",
    isDefault: true,
    content: {
      blocks: [
        {
          id: "1",
          type: "heading1",
          content: "RELATÓRIO TÉCNICO DE PROJETO",
        },
        {
          id: "2",
          type: "paragraph",
          content: "{{empresa.nome}}\nData: {{data.hoje}}",
        },
        {
          id: "3",
          type: "heading2",
          content: "1. IDENTIFICAÇÃO DO PROJETO",
        },
        {
          id: "4",
          type: "paragraph",
          content: "Projeto: {{projeto.nome}}\nTipo: {{projeto.tipo}}\nLocalização: {{projeto.endereco}}\nCliente: {{cliente.nome_completo}}",
        },
        {
          id: "5",
          type: "heading2",
          content: "2. OBJETIVO DO RELATÓRIO",
        },
        {
          id: "6",
          type: "paragraph",
          content: "Este relatório tem como objetivo apresentar o andamento técnico do projeto, documentar as decisões tomadas, registrar o escopo executado e informar a situação atual dos trabalhos desenvolvidos.",
        },
        {
          id: "7",
          type: "heading2",
          content: "3. RESUMO DO PROJETO",
        },
        {
          id: "8",
          type: "paragraph",
          content: "Descrição: {{projeto.descricao}}\nData de início: {{projeto.data_inicio}}\nPrevisão de conclusão: {{projeto.data_conclusao}}\nOrçamento: {{projeto.orcamento}}",
        },
        {
          id: "9",
          type: "heading2",
          content: "4. ESCOPO EXECUTADO",
        },
        {
          id: "10",
          type: "paragraph",
          content: "Até a presente data, foram executadas as seguintes atividades:",
        },
        {
          id: "11",
          type: "list",
          content: "Reunião de briefing e levantamento de necessidades do cliente\nVisita técnica ao local e levantamento de medidas\nDesenvolvimento de estudo preliminar com 3 alternativas de layout\nAprovação do conceito e diretrizes do projeto pelo cliente\nElaboração do anteprojeto com plantas humanizadas e perspectivas 3D\nDefinição da paleta de materiais e acabamentos\nInício do desenvolvimento do projeto executivo",
        },
        {
          id: "12",
          type: "heading2",
          content: "5. SITUAÇÃO ATUAL E PROGRESSO",
        },
        {
          id: "13",
          type: "paragraph",
          content: "Status do Projeto: Em andamento\nProgresso estimado: [XX]%\n\nEtapa atual: Desenvolvimento do projeto executivo\n\nPendências:\n- Aguardando confirmação do cliente sobre acabamento do piso da sala\n- Definição final das luminárias do projeto de iluminação\n- Aprovação dos detalhes de marcenaria da cozinha",
        },
        {
          id: "14",
          type: "heading2",
          content: "6. PONTOS DE ATENÇÃO",
        },
        {
          id: "15",
          type: "list",
          content: "Alteração solicitada pelo cliente na distribuição dos quartos (atraso de 5 dias)\nNecessidade de compatibilização do projeto estrutural existente\nPrazo de entrega de orçamentos de fornecedores afetando cronograma",
        },
        {
          id: "16",
          type: "heading2",
          content: "7. PRÓXIMAS ETAPAS",
        },
        {
          id: "17",
          type: "list",
          content: "Finalização das plantas executivas de layout e marcenaria\nElaboração das plantas de instalações (elétrica, hidráulica, ar-condicionado)\nDesenvolvimento dos detalhamentos técnicos especiais\nRevisão geral e preparação para entrega final\nAgendamento de reunião de apresentação dos projetos executivos",
        },
        {
          id: "18",
          type: "heading2",
          content: "8. ANEXOS E REFERÊNCIAS",
        },
        {
          id: "19",
          type: "paragraph",
          content: "- Anexo I: Plantas de estudo preliminar aprovadas\n- Anexo II: Painel de materiais e referências\n- Anexo III: Perspectivas 3D renderizadas\n- Anexo IV: Cronograma atualizado\n- Anexo V: Registro fotográfico da visita técnica",
        },
        {
          id: "20",
          type: "heading2",
          content: "9. CONSIDERAÇÕES FINAIS",
        },
        {
          id: "21",
          type: "paragraph",
          content: "O projeto encontra-se dentro do prazo previsto, com pequenos ajustes devido a solicitações de alteração do cliente. A qualidade técnica está sendo mantida conforme os padrões do escritório e as expectativas acordadas.",
        },
        {
          id: "22",
          type: "paragraph",
          content: "Responsável Técnico:",
        },
        {
          id: "23",
          type: "signature",
          content: "",
          signatureField: {
            id: "sig1",
            type: "responsavel",
            label: "{{empresa.responsavel_tecnico}} - {{empresa.nome}}",
          },
        },
      ],
    },
  },

  // 4. TERMO DE ENTREGA E ACEITE
  {
    name: "Termo de Entrega e Aceite do Projeto",
    category: "termo",
    isDefault: true,
    content: {
      blocks: [
        {
          id: "1",
          type: "heading1",
          content: "TERMO DE ENTREGA E ACEITE DE PROJETO",
        },
        {
          id: "2",
          type: "paragraph",
          content: "Pelo presente instrumento particular, as partes abaixo qualificadas:",
        },
        {
          id: "3",
          type: "heading2",
          content: "CONTRATANTE:",
        },
        {
          id: "4",
          type: "paragraph",
          content: "{{cliente.nome_completo}}, inscrito(a) no CPF sob o nº {{cliente.cpf}}, residente em {{cliente.endereco}}, {{cliente.cidade}} - {{cliente.estado}}, telefone {{cliente.telefone}}, e-mail {{cliente.email}}.",
        },
        {
          id: "5",
          type: "heading2",
          content: "CONTRATADO:",
        },
        {
          id: "6",
          type: "paragraph",
          content: "{{empresa.nome}}, inscrita no CNPJ sob o nº {{empresa.cnpj}}, com sede em {{empresa.endereco}}, representada por {{empresa.responsavel_tecnico}}.",
        },
        {
          id: "7",
          type: "heading2",
          content: "DO OBJETO:",
        },
        {
          id: "8",
          type: "paragraph",
          content: "O presente termo tem por objeto formalizar a entrega e o recebimento dos serviços de arquitetura e design de interiores referentes ao projeto denominado \"{{projeto.nome}}\", tipo {{projeto.tipo}}, localizado em {{projeto.endereco}}.",
        },
        {
          id: "9",
          type: "paragraph",
          content: "Descrição: {{projeto.descricao}}",
        },
        {
          id: "10",
          type: "heading2",
          content: "DOS PRODUTOS ENTREGUES:",
        },
        {
          id: "11",
          type: "paragraph",
          content: "O CONTRATADO declara haver entregue ao CONTRATANTE, nesta data, os seguintes produtos e materiais:",
        },
        {
          id: "12",
          type: "list",
          content: "Plantas baixas técnicas executivas em formato digital (PDF e DWG)\nPlantas de layout com distribuição de mobiliário\nPlantas de piso, forro e iluminação\nElevações de paredes com especificações de acabamentos\nProjeto de marcenaria detalhado com vistas e cortes\nDetalhamentos técnicos especiais\nMemorial descritivo completo\nPlanilha quantitativa de materiais\nPerspectivas 3D renderizadas dos ambientes\nPainel de materiais e paleta de cores\nArquivos fonte editáveis (.dwg, .skp, .rvt conforme aplicável)",
        },
        {
          id: "13",
          type: "paragraph",
          content: "Todos os arquivos foram entregues via e-mail e/ou plataforma de compartilhamento de arquivos (Google Drive / Dropbox / WeTransfer), conforme acordado entre as partes.",
        },
        {
          id: "14",
          type: "heading2",
          content: "DAS OBSERVAÇÕES:",
        },
        {
          id: "15",
          type: "paragraph",
          content: "- Os projetos entregues estão de acordo com o escopo contratado e aprovado pelo cliente.\n- Eventuais alterações futuras não previstas no escopo original poderão ser objeto de novo orçamento.\n- Os direitos autorais pertencem ao escritório contratado, sendo concedida ao cliente licença de uso para execução da obra objeto do projeto.\n- O cliente se compromete a não reproduzir, modificar ou utilizar os projetos para outros fins sem autorização expressa do contratado.\n- Recomenda-se que a execução da obra seja acompanhada por profissional habilitado para garantir a correta interpretação e execução dos projetos.",
        },
        {
          id: "16",
          type: "heading2",
          content: "DA QUITAÇÃO:",
        },
        {
          id: "17",
          type: "paragraph",
          content: "O CONTRATANTE declara que os valores referentes aos serviços prestados foram integralmente quitados, nada mais havendo a reclamar a qualquer título.",
        },
        {
          id: "18",
          type: "heading2",
          content: "DO ACEITE:",
        },
        {
          id: "19",
          type: "paragraph",
          content: "O CONTRATANTE, por meio da assinatura deste termo, declara haver recebido todos os materiais acima relacionados, conferiu sua integridade e conformidade com o escopo contratado, e manifesta seu aceite definitivo quanto aos serviços prestados e produtos entregues.",
        },
        {
          id: "20",
          type: "paragraph",
          content: "Por estarem assim justos e acordados, firmam o presente termo em duas vias de igual teor.",
        },
        {
          id: "21",
          type: "paragraph",
          content: "{{cliente.cidade}}, {{data.hoje}}",
        },
        {
          id: "22",
          type: "signature",
          content: "",
          signatureField: {
            id: "sig1",
            type: "cliente",
            label: "CONTRATANTE: {{cliente.nome_completo}}",
          },
        },
        {
          id: "23",
          type: "signature",
          content: "",
          signatureField: {
            id: "sig2",
            type: "responsavel",
            label: "CONTRATADO: {{empresa.nome}} - {{empresa.responsavel_tecnico}}",
          },
        },
      ],
    },
  },
];
