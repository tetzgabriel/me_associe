/* Banco do modo médico: 11 áreas de estudo, cada uma com 7 a 9 categorias de 12 palavras.
   Uma partida usa UMA área (7 categorias dela, 7 palavras sorteadas de cada), então as categorias
   da mesma partida são sempre do mesmo tema e nunca repetem palavra entre si.
   Regras para editar: sem palavra repetida dentro da mesma área, nenhuma palavra igual ao nome de
   uma categoria da área, e nenhuma palavra (separada por espaço ou hífen) com mais de 11 letras. */
(function (root) {
  'use strict';

  var BANK = [
    { area: 'Cardiologia', cats: [
      { nome: 'Arritmias', palavras: ['Fibrilação', 'Flutter', 'Taquicardia', 'Bradicardia', 'Torsades', 'Brugada', 'Pré-excitação', 'QT longo', 'BAV total', 'Assistolia', 'Wolff-Parkinson', 'Bloqueio de ramo'] },
      { nome: 'Valvopatias', palavras: ['Estenose aórtica', 'Estenose mitral', 'Insuf. mitral', 'Insuf. aórtica', 'Prolapso mitral', 'Insuf. tricúspide', 'Estenose pulmonar', 'Valva bicúspide', 'Febre reumática', 'Endocardite', 'Prótese mecânica', 'Sopro sistólico'] },
      { nome: 'Cardiopatia congênita', palavras: ['Fallot', 'CIA', 'CIV', 'PCA', 'Coarctação', 'TGA', 'Ebstein', 'Truncus', 'Canal AV', 'Atresia pulmonar', 'Eisenmenger', 'Hipoplasia VE'] },
      { nome: 'Anti-HAS', palavras: ['Losartana', 'Captopril', 'Enalapril', 'Anlodipino', 'Indapamida', 'Valsartana', 'Ramipril', 'Lisinopril', 'Hidralazina', 'Clonidina', 'Metildopa', 'Nifedipino'] },
      { nome: 'Fármacos do ritmo', palavras: ['Amiodarona', 'Adenosina', 'Verapamil', 'Diltiazem', 'Propafenona', 'Lidocaína', 'Digoxina', 'Flecainida', 'Quinidina', 'Mexiletina', 'Dronedarona', 'Ibutilida'] },
      { nome: 'Exames cardíacos', palavras: ['Troponina', 'BNP', 'Holter', 'MAPA', 'Cateterismo', 'Ergometria', 'Angio-TC', 'CK-MB', 'Tilt test', 'ECG', 'ETE', 'Ressonância'] },
      { nome: 'Miocárdio', palavras: ['Dilatada', 'CMH', 'Restritiva', 'Chagásica', 'Takotsubo', 'Periparto', 'Amiloidose', 'Alcoólica', 'Isquêmica', 'Sarcoidose', 'Miocardite', 'Fabry'] },
      { nome: 'Doença coronária', palavras: ['Angina estável', 'Angina instável', 'Prinzmetal', 'IAMCSST', 'IAMSSST', 'Supra de ST', 'Onda Q', 'Killip', 'ATC', 'Trombólise', 'Stent', 'Ponte safena'] }
    ] },
    { area: 'Pneumologia', cats: [
      { nome: 'Obstrutivas', palavras: ['Asma', 'DPOC', 'Enfisema', 'Bronquite crônica', 'Fibrose cística', 'Alfa-1', 'Sibilância', 'Tosse crônica', 'Atopia', 'Tabagismo', 'Exacerbação', 'Rinite'] },
      { nome: 'Interstício', palavras: ['Fibrose pulmonar', 'Sarcoidose', 'Silicose', 'Asbestose', 'Pneumonite', 'Colagenose', 'Granuloma', 'Vidro fosco', 'Favo de mel', 'Bagassose', 'Beriliose', 'Antracose'] },
      { nome: 'Infecção pulmonar', palavras: ['Pneumonia', 'Tuberculose', 'PCP', 'Aspergilose', 'Empiema', 'Abscesso', 'Legionella', 'Mycoplasma', 'Influenza', 'Covid-19', 'Coqueluche', 'Pneumococo'] },
      { nome: 'Vasos pulmonares', palavras: ['TEP', 'D-dímero', 'Wells', 'Heparina', 'Alteplase', 'Filtro de cava', 'Cor pulmonale', 'Hampton', 'Westermark', 'V/Q', 'Embolia', 'Sildenafil'] },
      { nome: 'Pleura', palavras: ['Derrame', 'Pneumotórax', 'Hemotórax', 'Quilotórax', 'Mesotelioma', 'Light', 'Transudato', 'Exsudato', 'Pleurodese', 'Pleurite', 'Atrito', 'Dreno'] },
      { nome: 'Ventilação', palavras: ['SDRA', 'PEEP', 'Intubação', 'VNI', 'CPAP', 'BiPAP', 'Hipoxemia', 'Hipercapnia', 'Gasometria', 'Pronação', 'Máscara', 'Berlim'] },
      { nome: 'Câncer de pulmão', palavras: ['Adenoca', 'Escamoso', 'Células pequenas', 'Carcinoide', 'Pancoast', 'Nódulo', 'Lobectomia', 'EGFR', 'ALK', 'PD-L1', 'Cisplatina', 'Rastreio'] },
      { nome: 'Inalatórios', palavras: ['Salbutamol', 'Formoterol', 'Budesonida', 'Fluticasona', 'Tiotrópio', 'Ipratrópio', 'Teofilina', 'Omalizumabe', 'Aminofilina', 'Fenoterol', 'Salmeterol', 'Terbutalina'] }
    ] },
    { area: 'Gastroenterologia', cats: [
      { nome: 'Hepatites', palavras: ['HBsAg', 'Anti-HCV', 'HBeAg', 'Anti-HBs', 'Interferon', 'Sofosbuvir', 'Entecavir', 'Tenofovir', 'Fecal-oral', 'Delta', 'Fulminante', 'ALT/AST'] },
      { nome: 'Cirrose', palavras: ['Ascite', 'PBE', 'Varizes', 'Asterixis', 'Child-Pugh', 'MELD', 'SHR', 'Paracentese', 'Lactulose', 'Octreotide', 'Rifaximina', 'TIPS'] },
      { nome: 'DII', palavras: ['Crohn', 'Retocolite', 'Mesalazina', 'Infliximabe', 'Azatioprina', 'Fístula', 'Pioderma', 'Megacólon', 'ASCA', 'p-ANCA', 'Íleo terminal', 'Eritema nodoso'] },
      { nome: 'Esôfago e estômago', palavras: ['DRGE', 'Barrett', 'Acalasia', 'H. pylori', 'Úlcera péptica', 'Zollinger-Ellison', 'Gastrite', 'Esofagite', 'Mallory-Weiss', 'Boerhaave', 'Dispepsia', 'Omeprazol'] },
      { nome: 'Pâncreas e vias biliares', palavras: ['Pancreatite', 'Colecistite', 'Colangite', 'Charcot', 'Reynolds', 'Murphy', 'CPRE', 'Lipase', 'Cullen', 'Grey-Turner', 'Courvoisier', 'Balthazar'] },
      { nome: 'Diarreias', palavras: ['Cólera', 'Salmonela', 'Shigelose', 'Giardíase', 'Amebíase', 'Rotavírus', 'C. difficile', 'E. coli', 'Norovírus', 'Febre tifoide', 'Soro oral', 'Disenteria'] },
      { nome: 'Neoplasias GI', palavras: ['CEA', 'Polipose', 'Lynch', 'Sangue oculto', 'Whipple', 'Krukenberg', 'Virchow', 'Borrmann', 'Linite', 'Adenoma', 'CA 19-9', 'Hartmann'] },
      { nome: 'Doença hepática', palavras: ['Esteatose', 'Wilson', 'Budd-Chiari', 'Ferritina', 'CBP', 'CEP', 'Autoimune', 'Alcoólica', 'Paracetamol', 'Kayser-Fleischer', 'Cobre', 'NASH'] }
    ] },
    { area: 'Endocrinologia', cats: [
      { nome: 'Diabetes', palavras: ['DM1', 'DM2', 'Cetoacidose', 'HbA1c', 'Metformina', 'NPH', 'Glargina', 'Gliclazida', 'iSGLT2', 'Liraglutida', 'Retinopatia', 'Pé diabético'] },
      { nome: 'Tireoide', palavras: ['Graves', 'Hashimoto', 'Bócio', 'TSH', 'T4 livre', 'Metimazol', 'PTU', 'Radioiodo', 'Exoftalmia', 'PAAF', 'Mixedema', 'Tempestade'] },
      { nome: 'Adrenal', palavras: ['Cushing', 'Addison', 'Conn', 'Cortisol', 'ACTH', 'Aldosterona', 'Supressão', 'Prednisona', 'Estrias', 'Crise adrenal', 'Giba de búfalo', 'Mielolipoma'] },
      { nome: 'Hipófise', palavras: ['Acromegalia', 'Prolactina', 'Sheehan', 'Diabetes insípido', 'SIADH', 'GH', 'IGF-1', 'Cabergolina', 'Octreotida', 'DDAVP', 'Sela túrcica', 'Hemianopsia'] },
      { nome: 'Osso e cálcio', palavras: ['Osteoporose', 'Paget', 'PTH', 'Vitamina D', 'Raquitismo', 'Osteopenia', 'Alendronato', 'Denosumabe', 'DEXA', 'Trousseau', 'Chvostek', 'Cinacalcete'] },
      { nome: 'Lipídios', palavras: ['Estatina', 'Ezetimiba', 'Fibrato', 'Niacina', 'LDL', 'HDL', 'VLDL', 'Xantoma', 'Arco corneano', 'Colesterol', 'PCSK9', 'Friedewald'] },
      { nome: 'Puberdade e gônadas', palavras: ['Turner', 'Klinefelter', 'Kallmann', 'Tanner', 'Menopausa', 'SOP', 'Hirsutismo', 'Amenorreia', 'Telarca', 'Pubarca', 'Idade óssea', 'Cariótipo'] },
      { nome: 'Tumores endócrinos', palavras: ['NEM 1', 'NEM 2A', 'Insulinoma', 'Gastrinoma', 'Glucagonoma', 'VIPoma', 'Carcinoide', 'RET', 'Menin', 'Sipple', 'Whipple', 'Eritema migratório'] }
    ] },
    { area: 'Nefrologia', cats: [
      { nome: 'Glomérulo', palavras: ['Nefrótica', 'Nefrítica', 'Berger', 'Goodpasture', 'Alport', 'Membranosa', 'Lesão mínima', 'GESF', 'Crescêntica', 'Proteinúria', 'Hematúria', 'Cilindros'] },
      { nome: 'Lesão renal', palavras: ['Pré-renal', 'Pós-renal', 'NTA', 'Nefrite', 'Contraste', 'Oligúria', 'Creatinina', 'Ureia', 'KDIGO', 'FeNa', 'Rabdo', 'Diálise'] },
      { nome: 'DRC', palavras: ['TFG', 'CKD-EPI', 'EPO', 'Fósforo', 'Hemodiálise', 'Peritoneal', 'Transplante', 'Fístula AV', 'Uremia', 'Albuminúria', 'Sevelâmer', 'Calcitriol'] },
      { nome: 'Sódio', palavras: ['SIADH', 'Mielinólise', 'Soro 3%', 'Restrição hídrica', 'Tolvaptan', 'Tonicidade', 'Polidipsia', 'Hipotônica', 'Natriurese', 'Correção lenta', 'Ureia urinária', 'Sede'] },
      { nome: 'Potássio', palavras: ['Onda T apiculada', 'QRS alargado', 'Gluconato de cálcio', 'Insulina', 'Kayexalate', 'Onda U', 'Fraqueza', 'Arritmia', 'Diurético', 'Reposição de K', 'Paralisia', 'Hemólise'] },
      { nome: 'Ácido-base', palavras: ['Ânion gap', 'Acidose', 'Alcalose', 'Metabólica', 'Hiperpneia', 'Compensação', 'Kussmaul', 'Lactato', 'Delta-delta', 'Bicarbonato', 'pCO2', 'Boston'] },
      { nome: 'Litíase e ITU', palavras: ['Cistite', 'Cólica renal', 'Cálculo', 'Oxalato', 'Urato', 'Cistina', 'Estruvita', 'Litotripsia', 'Tansulosina', 'Fosfomicina', 'Bacteriúria', 'Urocultura'] },
      { nome: 'Túbulo', palavras: ['Fanconi', 'Bartter', 'Gitelman', 'Liddle', 'ATR', 'Cistinose', 'Rim policístico', 'Rim esponja', 'Sjögren', 'Glicosúria', 'Poliúria', 'Tiazídico'] }
    ] },
    { area: 'Neurologia', cats: [
      { nome: 'AVC', palavras: ['Isquêmico', 'Hemorrágico', 'AIT', 'NIHSS', 'Alteplase', 'Janela', 'ASPECTS', 'Carótida', 'Hemiparesia', 'Penumbra', 'Cincinnati', 'Afasia'] },
      { nome: 'Cefaleias', palavras: ['Enxaqueca', 'Salvas', 'Tensional', 'Aura', 'Triptano', 'Topiramato', 'Flunarizina', 'Oxigênio', 'Hemicrania', 'Pseudotumor', 'Fotofobia', 'Fonofobia'] },
      { nome: 'Epilepsia', palavras: ['Tônico-clônica', 'Ausência', 'Fenitoína', 'Valproato', 'Lamotrigina', 'Diazepam', 'Lorazepam', 'West', 'Lennox-Gastaut', 'Pós-ictal', 'EEG', 'Jacksoniana'] },
      { nome: 'Demências', palavras: ['Alzheimer', 'Lewy', 'Pick', 'Vascular', 'Donepezila', 'Memantina', 'MEEM', 'Relógio', 'Creutzfeldt', 'Tau', 'Beta-amiloide', 'Hakim-Adams'] },
      { nome: 'Nervo e músculo', palavras: ['Guillain-Barré', 'Miastenia', 'ELA', 'Charcot-Marie', 'Duchenne', 'Botulismo', 'Neuropatia', 'Edrofônio', 'Timectomia', 'Arreflexia', 'Gower', 'Miopatia'] },
      { nome: 'Esclerose múltipla', palavras: ['Devic', 'Uhthoff', 'Lhermitte', 'Oligoclonal', 'Interferon', 'Fingolimode', 'Neurite óptica', 'Dawson', 'Surto', 'Mielite', 'Nistagmo', 'INO'] },
      { nome: 'Movimento', palavras: ['Parkinson', 'Levodopa', 'Tremor', 'Rigidez', 'Huntington', 'Coreia', 'Distonia', 'Discinesia', 'Pramipexol', 'Roda denteada', 'Balismo', 'Tique'] },
      { nome: 'Infecção do SNC', palavras: ['Meningite', 'Encefalite', 'LCR', 'Kernig', 'Brudzinski', 'Punção lombar', 'Aciclovir', 'Criptococo', 'Ceftriaxona', 'Pleocitose', 'Petéquias', 'Abscesso'] }
    ] },
    { area: 'Infectologia', cats: [
      { nome: 'HIV', palavras: ['CD4', 'Carga viral', 'Tenofovir', 'Lamivudina', 'Efavirenz', 'Kaposi', 'PrEP', 'PEP', 'Linfoma', 'Western blot', 'Janela imune', 'Teste rápido'] },
      { nome: 'Parasitoses', palavras: ['Malária', 'Calazar', 'Chagas', 'Toxoplasma', 'Ascaridíase', 'Oxiúros', 'Teníase', 'Ivermectina', 'Albendazol', 'Cloroquina', 'Primaquina', 'Plasmodium'] },
      { nome: 'Arboviroses', palavras: ['Dengue', 'Zika', 'Chikungunya', 'Febre amarela', 'Prova do laço', 'NS1', 'Alarme', 'Hematócrito', 'Hidratação', 'Aedes', 'Exantema', 'Artralgia'] },
      { nome: 'Sepse', palavras: ['SIRS', 'Choque séptico', 'qSOFA', 'SOFA', 'Hemocultura', 'Bundle', 'Hipotensão', 'Foco infeccioso', 'Cristaloide', 'Vasopressor', 'Lactato', 'Disfunção'] },
      { nome: 'ATB', palavras: ['Amoxicilina', 'Ceftazidima', 'Gentamicina', 'Doxiciclina', 'Linezolida', 'Polimixina', 'Oxacilina', 'Ampicilina', 'Cefalexina', 'Meropenem', 'Vancomicina', 'Cefepime'] },
      { nome: 'Micoses', palavras: ['Candidíase', 'Aspergilose', 'Criptococo', 'Histoplasma', 'Paracoco', 'Fluconazol', 'Anfo B', 'Voriconazol', 'Micafungina', 'Nistatina', 'Tinha', 'Mucormicose'] },
      { nome: 'ISTs', palavras: ['Sífilis', 'Gonorreia', 'Clamídia', 'VDRL', 'Treponema', 'Herpes', 'HPV', 'Cancro mole', 'Donovanose', 'Uretrite', 'Tricomonas', 'Condiloma'] },
      { nome: 'Vacinas', palavras: ['BCG', 'Tríplice viral', 'Penta', 'VOP', 'VIP', 'Rotavírus', 'Meningo C', 'dTpa', 'Varicela', 'Gardasil', 'Hepatite B', 'Calendário'] },
      { nome: 'Zoonoses', palavras: ['Raiva', 'Leptospira', 'Brucelose', 'Lyme', 'Hanseníase', 'Tétano', 'Antraz', 'Peste', 'Febre maculosa', 'Carrapato', 'Weil', 'Roedores'] }
    ] },
    { area: 'Pediatria', cats: [
      { nome: 'Neonato', palavras: ['Apgar', 'Icterícia', 'Moro', 'Teste do pezinho', 'Teste da orelhinha', 'Teste do olhinho', 'Colostro', 'Mecônio', 'Kernicterus', 'Capurro', 'Ballard', 'Surfactante'] },
      { nome: 'Marcos do DNPM', palavras: ['Sorriso social', 'Sustento cefálico', 'Sentar', 'Engatinhar', 'Andar', 'Pinça', 'Balbucio', 'Primeiras palavras', 'Denver', 'Preensão', 'Vocabulário', 'Brincar'] },
      { nome: 'Exantemas', palavras: ['Sarampo', 'Rubéola', 'Varicela', 'Roséola', 'Escarlatina', 'Eritema infeccioso', 'Kawasaki', 'Koplik', 'Mão-pé-boca', 'Exantema súbito', 'Forchheimer', 'Pastia'] },
      { nome: 'Vias aéreas', palavras: ['VSR', 'Crupe', 'Epiglotite', 'Estridor', 'Tiragem', 'Otite média', 'Amigdalite', 'Faringite', 'Torre', 'Adenoide', 'Sibilante', 'Resfriado'] },
      { nome: 'Alimentação', palavras: ['Leite materno', 'AME', 'Fórmula', 'Papinha', 'APLV', 'Desmame', 'Mamadeira', 'Cólica', 'Sucção', 'Pega', 'Mastite', 'Banco de leite'] },
      { nome: 'Genética', palavras: ['Down', 'Edwards', 'Patau', 'Turner', 'Prader-Willi', 'Williams', 'X frágil', 'Trissomia', 'Prega simiesca', 'Hipotonia', 'Mosaicismo', 'Cri-du-chat'] },
      { nome: 'Nutrição', palavras: ['Kwashiorkor', 'Marasmo', 'Percentil', 'Escore Z', 'Baixa estatura', 'Obesidade', 'Escorbuto', 'Anemia ferropriva', 'Xeroftalmia', 'Pelagra', 'Beribéri', 'Raquitismo'] },
      { nome: 'Urgências', palavras: ['Convulsão febril', 'Intoxicação', 'Corpo estranho', 'Engasgo', 'Queimadura', 'RCP', 'Reidratação', 'Plano C', 'Afogamento', 'Maus-tratos', 'Traumatismo', 'Heimlich'] },
      { nome: 'Cirurgia infantil', palavras: ['Estenose pilórica', 'Invaginação', 'Fimose', 'Hérnia inguinal', 'Apendicite', 'Onfalocele', 'Volvo', 'Torção', 'Atresia biliar', 'Hidrocele', 'Fenda labial', 'Pé torto'] }
    ] },
    { area: 'Ginecologia e Obstetrícia', cats: [
      { nome: 'Pré-natal', palavras: ['DUM', 'Beta-HCG', 'Naegele', 'USG morfológico', 'Ácido fólico', 'Sulfato ferroso', 'Curva glicêmica', 'Altura uterina', 'BCF', 'Leopold', 'Peso gestacional', 'Consultas'] },
      { nome: 'Pré-eclâmpsia', palavras: ['Eclâmpsia', 'HELLP', 'Sulfato de magnésio', 'Hidralazina', 'Metildopa', 'Proteinúria', 'Nifedipino', 'Edema', 'Escotomas', 'Convulsão', 'Plaquetas', 'Epigastro'] },
      { nome: 'Hemorragias', palavras: ['Placenta prévia', 'DPP', 'Rotura uterina', 'Atonia uterina', 'Acretismo', 'Vasa prévia', 'Misoprostol', 'Ocitocina', 'Bakri', 'Curetagem', 'Abortamento', 'Mola'] },
      { nome: 'Parto', palavras: ['Partograma', 'Bishop', 'Dilatação', 'Expulsivo', 'Fórcipe', 'Cesárea', 'Episiotomia', 'Amniotomia', 'Pélvica', 'Kristeller', 'Bolsa rota', 'Indução'] },
      { nome: 'Útero e ovário', palavras: ['Mioma', 'Adenomiose', 'Pólipo', 'Teratoma', 'Cólica menstrual', 'Menorragia', 'Hiperplasia', 'CA-125', 'Cisto de chocolate', 'Útero bicorno', 'Dispareunia', 'Septo uterino'] },
      { nome: 'Evitar gravidez', palavras: ['DIU', 'Implanon', 'Pílula', 'Laqueadura', 'Vasectomia', 'Camisinha', 'Diafragma', 'Injetável', 'Billings', 'Tabelinha', 'Adesivo', 'Anel vaginal'] },
      { nome: 'Câncer da mulher', palavras: ['Colpo', 'CIN', 'Colo uterino', 'Endométrio', 'Ovário', 'Mama', 'BI-RADS', 'Mamografia', 'Tamoxifeno', 'Conização', 'Wertheim', 'BRCA'] },
      { nome: 'Alto risco', palavras: ['Diabetes gestacional', 'Parto prematuro', 'Polidrâmnio', 'RCIU', 'Rh negativo', 'Cerclagem', 'Corticoide', 'Gemelar', 'Coombs', 'Hemolítica', 'Hidropisia', 'ILA'] },
      { nome: 'Puerpério', palavras: ['Lóquios', 'Involução', 'Mastite', 'Depressão pós-parto', 'Blues', 'Febre puerperal', 'Endometrite', 'Amamentação', 'Sheehan', 'Quarto período', 'Retração', 'Globo de Pinard'] }
    ] },
    { area: 'Cirurgia e Trauma', cats: [
      { nome: 'Trauma', palavras: ['ABCDE', 'FAST', 'Glasgow', 'Colar cervical', 'Prancha', 'Tríade de Beck', 'Tórax instável', 'Dreno de tórax', 'Choque hemorrágico', 'Lavado peritoneal', 'Via aérea', 'Pelve instável'] },
      { nome: 'Abdome agudo', palavras: ['Apendicite', 'Colecistite', 'Perfuração', 'Isquemia mesentérica', 'Blumberg', 'Rovsing', 'Psoas', 'Obturador', 'Alvarado', 'Peritonite', 'Bridas', 'Íleo biliar'] },
      { nome: 'Vascular', palavras: ['Aneurisma', 'Dissecção', 'TVP', 'Claudicação', 'ITB', 'Úlcera venosa', 'Fontaine', 'Leriche', 'Buerger', 'Raynaud', 'Stanford', 'Fogarty'] },
      { nome: 'Pele e feridas', palavras: ['Regra dos nove', 'Parkland', 'Lund-Browder', 'Terceiro grau', 'Escarotomia', 'Enxerto', 'Queloide', 'Mordedura', 'Fasciite', 'Gangrena', 'Fournier', 'Curativo'] },
      { nome: 'Anestesia', palavras: ['Propofol', 'Cetamina', 'Etomidato', 'Rocurônio', 'Fentanil', 'Morfina', 'Sevoflurano', 'Peridural', 'ASA', 'Mallampati', 'Sugamadex', 'Midazolam'] },
      { nome: 'Pós-operatório', palavras: ['Jejum', 'Risco cirúrgico', 'Goldman', 'Profilaxia', 'Cefazolina', 'Íleo paralítico', 'Deiscência', 'Seroma', 'Enoxaparina', 'Atelectasia', 'Evisceração', 'Hérnia incisional'] },
      { nome: 'Proctologia', palavras: ['Hemorroidas', 'Fissura anal', 'Fístula perianal', 'Abscesso perianal', 'Pilonidal', 'Prolapso retal', 'Colostomia', 'Esfíncter', 'Toque retal', 'Goodsall', 'Parks', 'Ligadura elástica'] },
      { nome: 'Cirurgias', palavras: ['Mastectomia', 'Linfonodo sentinela', 'Vagotomia', 'Colectomia', 'Nefrectomia', 'Cistectomia', 'Laparotomia', 'Lobectomia', 'Whipple', 'Amputação', 'Anastomose', 'Ressecção'] }
    ] },
    { area: 'Emergências', cats: [
      { nome: 'PCR', palavras: ['RCP', 'Desfibrilar', 'Adrenalina', 'Amiodarona', 'Ritmo chocável', 'Assistolia', 'AESP', 'Compressões', 'Via aérea', 'Hs e Ts', 'ROSC', 'Capnografia'] },
      { nome: 'Toxicologia', palavras: ['Atropina', 'Pralidoxima', 'Carvão ativado', 'Lavagem gástrica', 'Naloxona', 'Flumazenil', 'NAC', 'Monóxido', 'Metanol', 'Chumbinho', 'Cianeto', 'Digoxina'] },
      { nome: 'Choque', palavras: ['Séptico', 'Anafilático', 'Obstrutivo', 'Neurogênico', 'Hemorrágico', 'Dobutamina', 'Dopamina', 'PAM', 'Enchimento capilar', 'Pele fria', 'Oligúria', 'Taquicardia'] },
      { nome: 'Escalas e scores', palavras: ['CURB-65', 'CHA2DS2-VASc', 'HAS-BLED', 'TIMI', 'GRACE', 'NEWS', 'Centor', 'Padua', 'Caprini', 'Sokolow', 'Duke', 'Rockall'] },
      { nome: 'Alergia', palavras: ['Urticária', 'Angioedema', 'Anafilaxia', 'IgE', 'Prick test', 'Rinite', 'Dermatite atópica', 'Loratadina', 'Epinefrina', 'Hidroxizina', 'Látex', 'Amendoim'] },
      { nome: 'Sinais clássicos', palavras: ['Babinski', 'Romberg', 'Lasègue', 'Homans', 'Tinel', 'Phalen', 'Chaddock', 'Giordano', 'Murphy', 'Rovsing', 'Cullen', 'Kehr'] },
      { nome: 'Habilidades', palavras: ['Intubação', 'Paracentese', 'Punção lombar', 'Sondagem vesical', 'Dissecção venosa', 'Marcapasso', 'Sutura', 'Anestesia local', 'Sonda nasoenteral', 'Swan-Ganz', 'Drenagem', 'Gasometria arterial'] }
    ] }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = BANK;
  else root.MED_BANK = BANK;
})(typeof window !== 'undefined' ? window : globalThis);
