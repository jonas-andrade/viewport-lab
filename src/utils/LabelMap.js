// LabelMap.js — Vocabulário técnico completo de Three.js / renderização 3D
// Estrutura: chave => { label, desc, url? }
// url aponta para a doc oficial do Three.js quando existir

const BASE = 'https://threejs.org/docs/#api/en/materials/'
const BSRC = 'https://threejs.org/docs/#api/en/core/'
const BCAM = 'https://threejs.org/docs/#api/en/cameras/'
const BLIT = 'https://threejs.org/docs/#api/en/lights/'
const BGEO = 'https://threejs.org/docs/#api/en/geometries/'
const BREN = 'https://threejs.org/docs/#api/en/renderers/'
const BPOST= 'https://threejs.org/docs/#examples/en/postprocessing/'

export const LabelMap = {

  // ─────────────────────────────────────────────────────────────────────────
  // GEOMETRY
  // ─────────────────────────────────────────────────────────────────────────

  shape: {
    label: 'Shape',
    desc: 'Tipo de geometria da malha 3D. Cada shape é uma classe diferente do Three.js que gera vértices e faces de forma procedural.',
    url: BSRC + 'BufferGeometry'
  },
  geometry_box: {
    label: 'Box',
    desc: 'BoxGeometry — cubo com 6 faces retangulares. Parâmetros: width, height, depth + subdivisões por eixo.',
    url: BGEO + 'BoxGeometry'
  },
  geometry_sphere: {
    label: 'Sphere',
    desc: 'SphereGeometry — esfera gerada por latitude/longitude. widthSegments e heightSegments controlam a suavidade.',
    url: BGEO + 'SphereGeometry'
  },
  geometry_torus: {
    label: 'Torus',
    desc: 'TorusGeometry — anel (rosca). radius define o raio principal; tube define a espessura do tubo.',
    url: BGEO + 'TorusGeometry'
  },
  geometry_cone: {
    label: 'Cone',
    desc: 'ConeGeometry — cone com base circular. radialSegments define a suavidade lateral.',
    url: BGEO + 'ConeGeometry'
  },
  geometry_cylinder: {
    label: 'Cylinder',
    desc: 'CylinderGeometry — cilindro com raio superior e inferior independentes. Permite criar troncos e cones abertos.',
    url: BGEO + 'CylinderGeometry'
  },
  geometry_plane: {
    label: 'Plane',
    desc: 'PlaneGeometry — plano 2D com subdivisões. Útil como chão, paredes ou base para displacement maps.',
    url: BGEO + 'PlaneGeometry'
  },
  geometry_capsule: {
    label: 'Capsule',
    desc: 'CapsuleGeometry — cilindro com hemisférios nas pontas. Forma padrão de colliders em jogos.',
    url: BGEO + 'CapsuleGeometry'
  },
  geometry_torus_knot: {
    label: 'TorusKnot',
    desc: 'TorusKnotGeometry — nó tórico paramétrico. p e q controlam o número de voltas ao redor do eixo.',
    url: BGEO + 'TorusKnotGeometry'
  },
  geometry_icosahedron: {
    label: 'Icosahedron',
    desc: 'IcosahedronGeometry — sólido de 20 faces triangulares. Com detail > 0 gera esferas uniformes (sem polos).',
    url: BGEO + 'IcosahedronGeometry'
  },
  wireframe: {
    label: 'Wireframe',
    desc: 'Exibe apenas as arestas da malha (triângulos) sem preenchimento. Útil para inspecionar a topologia da geometria.',
    url: BASE + 'Material'
  },
  flat_shading: {
    label: 'Flat Shading',
    desc: 'Calcula a normal por face em vez de interpolá-la entre vértices. Cada triângulo recebe cor uniforme — aparência facetada.',
    url: BASE + 'MeshStandardMaterial'
  },
  segments: {
    label: 'Segments',
    desc: 'Número de subdivisões da malha. Mais segmentos = geometria mais suave, porém mais vértices e maior custo de GPU.',
    url: BGEO + 'BoxGeometry'
  },
  rotate_x: {
    label: 'Rotate X',
    desc: 'Rotação no eixo X em radianos. Um giro completo = 2π (~6.28). Equivale a mesh.rotation.x no Three.js.',
    url: BSRC + 'Object3D'
  },
  rotate_y: {
    label: 'Rotate Y',
    desc: 'Rotação no eixo Y em radianos. Principal eixo de rotação lateral (spin) em objetos 3D.',
    url: BSRC + 'Object3D'
  },
  rotate_z: {
    label: 'Rotate Z',
    desc: 'Rotação no eixo Z em radianos. Equivale a inclinar o objeto para os lados.',
    url: BSRC + 'Object3D'
  },
  scale: {
    label: 'Scale',
    desc: 'Escala uniforme do objeto nos 3 eixos. 1.0 = tamanho original. Equivale a mesh.scale.setScalar(v).',
    url: BSRC + 'Object3D'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SURFACE / MATERIAL
  // ─────────────────────────────────────────────────────────────────────────

  material_type: {
    label: 'Material Type',
    desc: 'Define o modelo de shading — o algoritmo que calcula como a luz interage com a superfície. Cada material tem um custo diferente de GPU.',
    url: BASE + 'Material'
  },
  mat_basic: {
    label: 'MeshBasicMaterial',
    desc: 'Material sem cálculo de iluminação. A cor é exibida pura, independente de qualquer luz na cena. Mais barato de renderizar.',
    url: BASE + 'MeshBasicMaterial'
  },
  mat_lambert: {
    label: 'MeshLambertMaterial',
    desc: 'Modelo difuso de Lambert — sem brilho especular. Rápido, bom para superfícies opacas e mate.',
    url: BASE + 'MeshLambertMaterial'
  },
  mat_phong: {
    label: 'MeshPhongMaterial',
    desc: 'Modelo de Phong — difuso + brilho especular (shininess). Modelo clássico pré-PBR, bom para plástico brilhante.',
    url: BASE + 'MeshPhongMaterial'
  },
  mat_standard: {
    label: 'MeshStandardMaterial',
    desc: 'Material PBR (Physically Based Rendering) padrão do Three.js. Usa roughness e metalness para simular fisicamente a superfície.',
    url: BASE + 'MeshStandardMaterial'
  },
  mat_physical: {
    label: 'MeshPhysicalMaterial',
    desc: 'Extensão do Standard com clearcoat, transmission (vidro) e IOR. O mais realista disponível no Three.js.',
    url: BASE + 'MeshPhysicalMaterial'
  },
  mat_toon: {
    label: 'MeshToonMaterial',
    desc: 'Cel Shading — shading em bandas planas sem gradiente suave, imitando desenhos animados. Usa um gradientMap para definir as faixas.',
    url: BASE + 'MeshToonMaterial'
  },
  mat_normal: {
    label: 'MeshNormalMaterial',
    desc: 'Exibe as normais da geometria mapeadas como cores RGB (X→vermelho, Y→verde, Z→azul). Útil para debug de geometria.',
    url: BASE + 'MeshNormalMaterial'
  },
  mat_depth: {
    label: 'MeshDepthMaterial',
    desc: 'Exibe a profundidade Z: objetos próximos são escuros, distantes são claros. Usado em shadow maps e efeitos de pós-processamento.',
    url: BASE + 'MeshDepthMaterial'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PBR — PROPRIEDADES
  // ─────────────────────────────────────────────────────────────────────────

  albedo: {
    label: 'Albedo',
    desc: 'Cor base da superfície sem influência direta de luz. Em PBR é a refletância difusa — quanto da luz incidente é espalhada em todas as direções.',
    url: BASE + 'MeshStandardMaterial'
  },
  roughness: {
    label: 'Roughness',
    desc: 'Rugosidade da superfície. 0 = espelho perfeito (sem dispersão). 1 = totalmente fosco (dispersão máxima). Controla o tamanho e foco do highlight.',
    url: BASE + 'MeshStandardMaterial'
  },
  metalness: {
    label: 'Metalness',
    desc: 'Metalicidade. 0 = dielétrico (plástico, madeira, pele). 1 = condutor metálico. Metais refletem a cor do albedo; dielétricos refletem branco.',
    url: BASE + 'MeshStandardMaterial'
  },
  emissive: {
    label: 'Emissive',
    desc: 'Cor que a superfície emite independente de qualquer luz. Não ilumina outros objetos (use PointLight para isso). Útil para telas, LEDs, lava.',
    url: BASE + 'MeshStandardMaterial'
  },
  emissive_intensity: {
    label: 'Emissive Intensity',
    desc: 'Multiplica a cor emissiva. Valores > 1 aumentam o brilho além do range SDR, útil com Bloom ativado.',
    url: BASE + 'MeshStandardMaterial'
  },
  opacity: {
    label: 'Opacity',
    desc: '0 = completamente invisível. 1 = totalmente opaco. Requer transparent = true para funcionar. Afeta o alpha de todos os fragments.',
    url: BASE + 'Material'
  },
  transparent: {
    label: 'Transparent',
    desc: 'Habilita o modo de renderização com transparência. Objetos transparentes são renderizados depois dos opacos (no pipeline de blending).',
    url: BASE + 'Material'
  },
  side: {
    label: 'Side',
    desc: 'Controla qual face do triângulo é renderizada. FrontSide (padrão), BackSide (interior) ou DoubleSide (ambos, mais pesado).',
    url: BASE + 'Material'
  },
  clearcoat: {
    label: 'Clearcoat',
    desc: 'Camada fina e brilhante sobre o material base — simula verniz, laca ou o acabamento de carros. Exclusivo do MeshPhysicalMaterial.',
    url: BASE + 'MeshPhysicalMaterial'
  },
  clearcoat_roughness: {
    label: 'Clearcoat Roughness',
    desc: 'Rugosidade da camada de clearcoat independente do material base. 0 = verniz espelho. Exclusivo do MeshPhysicalMaterial.',
    url: BASE + 'MeshPhysicalMaterial'
  },
  transmission: {
    label: 'Transmission',
    desc: 'Transmissão de luz — simula vidro e materiais translúcidos. 1 = completamente transmissivo. Requer renderer com transmission render target.',
    url: BASE + 'MeshPhysicalMaterial'
  },
  ior: {
    label: 'IOR',
    desc: 'Index of Refraction — índice de refração. Controla o quanto a luz dobra ao atravessar o material. Água = 1.33, Vidro = 1.5, Diamante = 2.42.',
    url: BASE + 'MeshPhysicalMaterial'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PBR MAPS (TEXTURE SLOTS)
  // ─────────────────────────────────────────────────────────────────────────

  texture_slot: {
    label: 'Texture Slot',
    desc: 'Canal de textura a ser preenchido. Cada slot lê dados de uma imagem e os aplica a uma propriedade do material (cor, rugosidade, normais etc.).',
    url: BASE + 'MeshStandardMaterial'
  },
  albedo_map: {
    label: 'Albedo Map',
    desc: 'map — textura de cor base (diffuse). Multiplica pixel a pixel com a propriedade color do material. Disponível em MeshStandardMaterial e outros.',
    url: BASE + 'MeshStandardMaterial'
  },
  normal_map: {
    label: 'Normal Map',
    desc: 'Simula micro-relevos sem adicionar geometria real. Armazena direções de normal em RGB. Não desloca vértices — é uma ilusão óptica de iluminação.',
    url: BASE + 'MeshStandardMaterial'
  },
  roughness_map: {
    label: 'Roughness Map',
    desc: 'Controla roughness por pixel via canal verde da textura. Permite superfícies com áreas brilhantes e fosca na mesma malha.',
    url: BASE + 'MeshStandardMaterial'
  },
  metalness_map: {
    label: 'Metalness Map',
    desc: 'Controla metalness por pixel via canal azul da textura. Permite partes metálicas e não-metálicas no mesmo objeto.',
    url: BASE + 'MeshStandardMaterial'
  },
  ao_map: {
    label: 'AO Map',
    desc: 'Ambient Occlusion Map — sombras de contato pré-calculadas. Escurece frestas e cantos onde a luz ambiente não alcança facilmente.',
    url: BASE + 'MeshStandardMaterial'
  },
  displacement_map: {
    label: 'Displacement Map',
    desc: 'Desloca vértices reais pela textura (canal vermelho). Diferente do Normal Map — cria geometria real. Requer segmentos suficientes.',
    url: BASE + 'MeshStandardMaterial'
  },
  emissive_map: {
    label: 'Emissive Map',
    desc: 'Textura que define quais áreas emitem luz. Multiplica com emissive color. Útil para telas, janelas iluminadas, circuitos.',
    url: BASE + 'MeshStandardMaterial'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LIGHTING
  // ─────────────────────────────────────────────────────────────────────────

  light_type: {
    label: 'Light Type',
    desc: 'Tipo de fonte de luz a adicionar. Cada tipo simula um comportamento físico diferente de emissão de luz.',
    url: BLIT + 'Light'
  },
  ambient_light: {
    label: 'AmbientLight',
    desc: 'Luz global sem direção ou posição. Ilumina todos os objetos igualmente. Não produz sombras. Simula luz de ambiente indireta.',
    url: BLIT + 'AmbientLight'
  },
  directional_light: {
    label: 'DirectionalLight',
    desc: 'Luz com direção paralela — todos os raios são paralelos entre si. Simula o sol (distância infinita). Suporta shadow map.',
    url: BLIT + 'DirectionalLight'
  },
  point_light: {
    label: 'PointLight',
    desc: 'Ponto de luz que irradia em todas as direções a partir de uma posição. Simula lâmpadas e tochas. Tem range e decay.',
    url: BLIT + 'PointLight'
  },
  spot_light: {
    label: 'SpotLight',
    desc: 'Cone de luz com ângulo controlável. Tem position, target, angle e penumbra. Suporta shadow map. Simula holofotes.',
    url: BLIT + 'SpotLight'
  },
  hemisphere_light: {
    label: 'HemisphereLight',
    desc: 'Gradiente de luz entre céu (skyColor) e chão (groundColor). Simula iluminação de ambiente ao ar livre de forma barata.',
    url: BLIT + 'HemisphereLight'
  },
  light_intensity: {
    label: 'Intensity',
    desc: 'Intensidade da luz em candelas (cd). O Three.js usa unidades físicas desde r155. Valores típicos: sol ≈ 100.000, lâmpada de 60W ≈ 800.',
    url: BLIT + 'Light'
  },
  light_color: {
    label: 'Color',
    desc: 'Cor da luz emitida. Afeta todos os objetos iluminados por ela. Branco (0xffffff) é neutro. Temperaturas de cor: azul = frio, laranja = quente.',
    url: BLIT + 'Light'
  },
  show_helper: {
    label: 'Show Helper',
    desc: 'Exibe um helper 3D que visualiza a posição, direção e alcance da luz na cena. Não é renderizado na cena final.',
    url: BLIT + 'DirectionalLightHelper'
  },
  visible: {
    label: 'Visible',
    desc: 'object3D.visible — controla se o objeto (luz, malha ou helper) é processado pelo renderer. false = ignorado completamente.',
    url: BSRC + 'Object3D'
  },
  penumbra: {
    label: 'Penumbra',
    desc: 'Suavidade da borda do cone do SpotLight. 0 = borda dura. 1 = transição suave do máximo ao zero de intensidade.',
    url: BLIT + 'SpotLight'
  },
  angle: {
    label: 'Angle',
    desc: 'Ângulo de abertura do cone do SpotLight em radianos. Máximo = π/2 (90°). Valores maiores criam cones mais abertos.',
    url: BLIT + 'SpotLight'
  },
  ground_color: {
    label: 'Ground Color',
    desc: 'Cor da luz vinda de baixo no HemisphereLight. Simula a luz refletida pelo solo. Complementa o skyColor.',
    url: BLIT + 'HemisphereLight'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SHADOW
  // ─────────────────────────────────────────────────────────────────────────

  shadow_map: {
    label: 'Shadow Map',
    desc: 'Algoritmo usado para calcular sombras. O renderer renderiza a cena do ponto de vista da luz para criar um depth buffer — o shadow map.',
    url: BREN + 'WebGLRenderer'
  },
  shadow_basic: {
    label: 'BasicShadowMap',
    desc: 'Sombra mais rápida — lê o shadow map diretamente sem filtragem. Bordas duras e aliasing visível. Use quando performance é crítica.',
    url: BREN + 'WebGLRenderer'
  },
  shadow_pcf: {
    label: 'PCFShadowMap',
    desc: 'Percentage Closer Filtering — amostra múltiplos pixels do shadow map e faz média. Bordas suavizadas. Custo moderado.',
    url: BREN + 'WebGLRenderer'
  },
  shadow_pcfsoft: {
    label: 'PCFSoftShadowMap',
    desc: 'PCF com kernel maior e blur extra. Sombras mais difusas e naturais. Padrão recomendado para a maioria dos projetos.',
    url: BREN + 'WebGLRenderer'
  },
  shadow_vsm: {
    label: 'VSMShadowMap',
    desc: 'Variance Shadow Map — armazena média e variância da profundidade. Sombras muito suaves mas com light bleeding em certas geometrias.',
    url: BREN + 'WebGLRenderer'
  },
  map_size: {
    label: 'Map Size',
    desc: 'Resolução do shadow map em pixels (ex: 1024×1024). Valores maiores = sombras mais nítidas mas maior uso de VRAM e tempo de render.',
    url: BLIT + 'LightShadow'
  },
  cast_shadow: {
    label: 'Cast Shadow',
    desc: 'mesh.castShadow — o objeto projeta sombra sobre outros. A luz precisa ter castShadow = true também.',
    url: BSRC + 'Object3D'
  },
  receive_shadow: {
    label: 'Receive Shadow',
    desc: 'mesh.receiveShadow — o objeto recebe sombra projetada por outros. O material precisa processar o shadow map.',
    url: BSRC + 'Object3D'
  },
  shadow_bias: {
    label: 'Shadow Bias',
    desc: 'Offset aplicado ao cálculo de profundidade do shadow map. Corrige shadow acne (auto-sombra). Bias positivo demais causa peter panning.',
    url: BLIT + 'LightShadow'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ENVIRONMENT
  // ─────────────────────────────────────────────────────────────────────────

  background: {
    label: 'Background',
    desc: 'scene.background — cor ou textura de fundo da cena. Pode ser Color, Texture ou CubeTexture (skybox).',
    url: 'https://threejs.org/docs/#api/en/scenes/Scene'
  },
  fog_type: {
    label: 'Fog Type',
    desc: 'scene.fog — névoa que faz objetos distantes desaparecerem. None desativa. Linear e Exponential são os dois modelos disponíveis.',
    url: 'https://threejs.org/docs/#api/en/scenes/Scene'
  },
  fog_linear: {
    label: 'Fog (Linear)',
    desc: 'THREE.Fog(color, near, far) — densidade constante entre near e far. Simples e previsível. Boa para interiores e tunel.',
    url: 'https://threejs.org/docs/#api/en/scenes/Fog'
  },
  fog_exp: {
    label: 'FogExp2',
    desc: 'THREE.FogExp2(color, density) — densidade cresce exponencialmente com a distância. Mais natural para exteriores e neblina.',
    url: 'https://threejs.org/docs/#api/en/scenes/FogExp2'
  },
  fog_near: {
    label: 'Fog Near',
    desc: 'Distância a partir da qual a névoa linear começa a aparecer. Objetos mais próximos que este valor não são afetados.',
    url: 'https://threejs.org/docs/#api/en/scenes/Fog'
  },
  fog_far: {
    label: 'Fog Far',
    desc: 'Distância em que a névoa linear atinge opacidade total. Objetos além deste valor ficam completamente encobertos.',
    url: 'https://threejs.org/docs/#api/en/scenes/Fog'
  },
  fog_density: {
    label: 'Fog Density',
    desc: 'Densidade da névoa exponencial. Valores típicos: 0.01 (leve) a 0.1 (denso). Afeta o quanto a névoa aumenta por unidade de distância.',
    url: 'https://threejs.org/docs/#api/en/scenes/FogExp2'
  },
  fog_color: {
    label: 'Fog Color',
    desc: 'Cor da névoa. Para aparência natural deve ser próxima da cor do background. Névoa colorida cria efeitos atmosféricos especiais.',
    url: 'https://threejs.org/docs/#api/en/scenes/Fog'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // CAMERA
  // ─────────────────────────────────────────────────────────────────────────

  projection: {
    label: 'Projection',
    desc: 'Modo de projeção da câmera. Perspective simula a visão humana. Orthographic projeta sem perspectiva — linhas paralelas nunca convergem.',
    url: BCAM + 'Camera'
  },
  perspective_camera: {
    label: 'PerspectiveCamera',
    desc: 'Projeção cônica — objetos distantes aparecem menores. Simula a visão humana e câmeras fotográficas. Parâmetros: fov, aspect, near, far.',
    url: BCAM + 'PerspectiveCamera'
  },
  orthographic_camera: {
    label: 'OrthographicCamera',
    desc: 'Projeção paralela — sem distorção de perspectiva. Objetos distantes têm o mesmo tamanho. Usada em jogos 2D, CAD e viewports técnicos.',
    url: BCAM + 'OrthographicCamera'
  },
  fov: {
    label: 'FOV',
    desc: 'Field of View vertical em graus. Valores típicos: 45° (telefoto), 60° (normal), 90°+ (grande angular). FOV maior = mais distorção nas bordas.',
    url: BCAM + 'PerspectiveCamera'
  },
  zoom: {
    label: 'Zoom',
    desc: 'camera.zoom — fator de ampliação. Na Perspective comprime o FOV. Na Orthographic escala o frustum. 1 = sem zoom.',
    url: BCAM + 'Camera'
  },
  near_clip: {
    label: 'Near Clip',
    desc: 'Plano de corte próximo. Objetos mais próximos que este valor são invisíveis. Valores muito pequenos causam z-fighting.',
    url: BCAM + 'PerspectiveCamera'
  },
  far_clip: {
    label: 'Far Clip',
    desc: 'Plano de corte distante. A diferença far/near define a precisão do Z-buffer. Uma razão alta (ex: 10000/0.001) causa z-fighting.',
    url: BCAM + 'PerspectiveCamera'
  },
  view_preset: {
    label: 'View Preset',
    desc: 'Posições de câmera pré-definidas. Comum em viewports de DCC tools (Blender, Maya). Default = 3/4 view; Top/Front/Side = vistas ortogonais clássicas.',
    url: BCAM + 'Camera'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // POST PROCESSING
  // ─────────────────────────────────────────────────────────────────────────

  bloom: {
    label: 'Bloom',
    desc: 'UnrealBloomPass — brilho que vaza nas bordas de áreas claras, simulando overexposure de câmeras físicas. Efeito essencial em cenas HDR.',
    url: BPOST + 'UnrealBloomPass'
  },
  bloom_threshold: {
    label: 'Bloom Threshold',
    desc: 'Luminosidade mínima (0–1) para acionar o bloom. Pixels abaixo do threshold não brilham. Diminuir = mais áreas brilhando.',
    url: BPOST + 'UnrealBloomPass'
  },
  bloom_strength: {
    label: 'Bloom Strength',
    desc: 'Intensidade do bloom. Valores altos criam glow intenso. Com Emissive Intensity alta, produz efeito neon.',
    url: BPOST + 'UnrealBloomPass'
  },
  bloom_radius: {
    label: 'Bloom Radius',
    desc: 'Raio de espalhamento do bloom. Controla o quanto o brilho se espalha além da área brilhante original.',
    url: BPOST + 'UnrealBloomPass'
  },
  ssao: {
    label: 'SSAO',
    desc: 'Screen Space Ambient Occlusion — escurece frestas, cantos e contatos entre objetos em tempo real. Simula a oclusão de luz ambiente por geometria próxima.',
    url: BPOST + 'SSAOPass'
  },
  ssao_radius: {
    label: 'SSAO Radius',
    desc: 'Raio de busca de oclusão em pixels de screen space. Valores maiores detectam oclusão em áreas mais amplas mas aumentam o custo.',
    url: BPOST + 'SSAOPass'
  },
  fxaa: {
    label: 'FXAA',
    desc: 'Fast Approximate Anti-Aliasing — suaviza bordas serrilhadas (jaggies) operando sobre o frame já renderizado. Barato mas menos preciso que MSAA.',
    url: BPOST + 'ShaderPass'
  },
  vignette: {
    label: 'Vignette',
    desc: 'Escurecimento progressivo das bordas da tela. Direciona o olhar para o centro. Efeito de câmera analógica e dramaturgia cinematográfica.',
    url: BPOST + 'ShaderPass'
  },
  vignette_offset: {
    label: 'Vignette Offset',
    desc: 'O quanto a vinheta avança em direção ao centro. Valores maiores fazem o escurecimento invadir mais a área central.',
    url: BPOST + 'ShaderPass'
  },
  vignette_darkness: {
    label: 'Vignette Darkness',
    desc: 'Intensidade do escurecimento nas bordas. 0 = sem efeito. 2 = bordas quase completamente pretas.',
    url: BPOST + 'ShaderPass'
  },
  film_grain: {
    label: 'Film Grain',
    desc: 'FilmPass — adiciona ruído (granulação) e opcionalmente linhas de scan ao frame. Imita o aspecto de filme analógico.',
    url: BPOST + 'FilmPass'
  },
  noise_intensity: {
    label: 'Noise Intensity',
    desc: 'Intensidade do ruído do Film Grain. 0 = sem granulação. 1 = ruído máximo cobrindo a imagem.',
    url: BPOST + 'FilmPass'
  },
  grayscale: {
    label: 'Grayscale',
    desc: 'Converte o frame para preto e branco como parte do FilmPass. Simula filme monocromático.',
    url: BPOST + 'FilmPass'
  },
  enable: {
    label: 'Enable',
    desc: 'Ativa ou desativa o módulo inteiro. false = o painel é ignorado e não afeta a cena (geometria oculta, luzes desligadas, sombras desativadas etc.).',
    url: BSRC + 'Object3D'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RENDERER
  // ─────────────────────────────────────────────────────────────────────────

  tone_mapping: {
    label: 'Tone Mapping',
    desc: 'Converte cores HDR (alto alcance dinâmico, valores > 1) para o range SDR da tela (0–1). Como a "revelação fotográfica" do frame 3D.',
    url: BREN + 'WebGLRenderer'
  },
  tone_linear: {
    label: 'LinearToneMapping',
    desc: 'Sem curva — escala linear direta. Sem correção de contraste. Útil para debug ou quando o controle é feito manualmente.',
    url: BREN + 'WebGLRenderer'
  },
  tone_reinhard: {
    label: 'ReinhardToneMapping',
    desc: 'Operador de Reinhard — comprime altas luzes de forma suave. Resultado natural mas pode parecer esmaecido em cenas muito brilhantes.',
    url: BREN + 'WebGLRenderer'
  },
  tone_cineon: {
    label: 'CineonToneMapping',
    desc: 'Baseado na curva de filme Kodak Cineon. Tons quentes e contrastados, visual cinematográfico analógico.',
    url: BREN + 'WebGLRenderer'
  },
  tone_aces: {
    label: 'ACESFilmicToneMapping',
    desc: 'Academy Color Encoding System — padrão da indústria cinematográfica. Sombras preservadas, highlights comprimidos elegantemente. O mais usado em jogos modernos.',
    url: BREN + 'WebGLRenderer'
  },
  exposure: {
    label: 'Exposure',
    desc: 'renderer.toneMappingExposure — multiplica o brilho antes do tone mapping. 1.0 = neutro. < 1 = subexposto. > 1 = superexposto.',
    url: BREN + 'WebGLRenderer'
  },
  pixel_ratio: {
    label: 'Pixel Ratio',
    desc: 'renderer.setPixelRatio() — quantos pixels físicos por pixel CSS. Em telas Retina (DPR=2) dobra os pixels renderizados. Reduzir melhora performance.',
    url: BREN + 'WebGLRenderer'
  },
  color_space: {
    label: 'Color Space',
    desc: 'renderer.outputColorSpace — espaço de cor do frame final. SRGBColorSpace (padrão web) aplica correção de gamma. Linear mantém valores crus.',
    url: BREN + 'WebGLRenderer'
  },
}