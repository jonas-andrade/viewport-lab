// LabelMap.js
// Dicionário de termos técnicos de renderização 3D
// Estrutura: CHAVE => { label: 'termo original', desc: 'explicação PT-BR' }


export const LabelMap = {

    // ── GEOMETRY ──────────────────────────────────────────────────────────────
    geometry_box: { label: 'Box', desc: 'Cubo — geometria de 6 faces' },
    geometry_sphere: { label: 'Sphere', desc: 'Esfera subdividida em segmentos' },
    geometry_torus: { label: 'Torus', desc: 'Rosquinha — anel circular' },
    geometry_cone: { label: 'Cone', desc: 'Cone com base circular' },
    geometry_cylinder: { label: 'Cylinder', desc: 'Cilindro com topos opcionais' },
    geometry_plane: { label: 'Plane', desc: 'Plano flat, 2 triângulos' },
    geometry_capsule: { label: 'Capsule', desc: 'Cápsula — cilindro com hemisférios' },
    geometry_torus_knot: { label: 'TorusKnot', desc: 'Nó tórico — forma orgânica complexa' },
    geometry_icosahedron: { label: 'Icosahedron', desc: 'Sólido de 20 faces triangulares' },
    wireframe: { label: 'Wireframe', desc: 'Exibe apenas as arestas da malha' },
    flat_shading: { label: 'Flat Shading', desc: 'Cada face tem cor uniforme — sem suavização' },
    segments: { label: 'Segments', desc: 'Subdivisões da malha — mais = mais suave' },

    // ── SURFACE / MATERIAL ────────────────────────────────────────────────────
    mat_basic: { label: 'MeshBasicMaterial', desc: 'Sem cálculo de luz — cor pura' },
    mat_lambert: { label: 'MeshLambertMaterial', desc: 'Difuso simples — sem brilho especular' },
    mat_phong: { label: 'MeshPhongMaterial', desc: 'Difuso + especular — modelo clássico' },
    mat_standard: { label: 'MeshStandardMaterial', desc: 'PBR padrão — roughness + metalness' },
    mat_physical: { label: 'MeshPhysicalMaterial', desc: 'PBR estendido — clearcoat, transmissão' },
    mat_toon: { label: 'MeshToonMaterial', desc: 'Cel Shading — bandas de cor chapadas' },
    mat_normal: { label: 'MeshNormalMaterial', desc: 'Exibe normais como cor RGB' },
    mat_depth: { label: 'MeshDepthMaterial', desc: 'Exibe profundidade — preto=perto, branco=longe' },

    // ── PBR PROPERTIES ────────────────────────────────────────────────────────
    color: { label: 'Color / Albedo', desc: 'Cor base da superfície sem influência de luz' },
    roughness: { label: 'Roughness', desc: 'Rugosidade — 0=espelho, 1=fosco' },
    metalness: { label: 'Metalness', desc: 'Metalicidade — 0=dielétrico, 1=metal' },
    emissive: { label: 'Emissive', desc: 'Cor que o objeto emite — independe de luz' },
    emissive_intensity: { label: 'Emissive Intensity', desc: 'Intensidade do brilho emitido' },
    opacity: { label: 'Opacity', desc: 'Transparência — 0=invisível, 1=sólido' },
    transparent: { label: 'Transparent', desc: 'Habilita renderização com transparência' },
    side_front: { label: 'FrontSide', desc: 'Renderiza apenas a face frontal' },
    side_back: { label: 'BackSide', desc: 'Renderiza apenas a face traseira' },
    side_double: { label: 'DoubleSide', desc: 'Renderiza ambos os lados da face' },

    // ── PBR MAPS ──────────────────────────────────────────────────────────────
    map: { label: 'Albedo Map', desc: 'Textura de cor base (diffuse)' },
    normal_map: { label: 'Normal Map', desc: 'Simula relevo sem adicionar geometria' },
    roughness_map: { label: 'Roughness Map', desc: 'Controla rugosidade por pixel' },
    metalness_map: { label: 'Metalness Map', desc: 'Controla metalicidade por pixel' },
    ao_map: { label: 'AO Map', desc: 'Ambient Occlusion — sombras de contato pré-calculadas' },
    displacement_map: { label: 'Displacement Map', desc: 'Desloca vértices reais pela textura' },
    env_map: { label: 'Environment Map', desc: 'Reflexo do ambiente na superfície' },

    // ── LIGHTING ──────────────────────────────────────────────────────────────
    light_ambient: { label: 'AmbientLight', desc: 'Luz sem direção — ilumina tudo igualmente' },
    light_directional: { label: 'DirectionalLight', desc: 'Luz direcional paralela — simula sol' },
    light_point: { label: 'PointLight', desc: 'Ponto de luz que irradia em todas direções' },
    light_spot: { label: 'SpotLight', desc: 'Cone de luz com ângulo controlável' },
    light_hemisphere: { label: 'HemisphereLight', desc: 'Luz céu/chão — gradiente de cima pra baixo' },
    light_rect: { label: 'RectAreaLight', desc: 'Luz de área retangular — tipo painel LED' },
    light_intensity: { label: 'Intensity', desc: 'Força da luz emitida' },
    light_color: { label: 'Color', desc: 'Cor da luz — afeta toda a cena iluminada por ela' },
    light_helper: { label: 'Light Helper', desc: 'Visualizador da posição e direção da luz' },

    // ── SHADOW ────────────────────────────────────────────────────────────────
    shadow_basic: { label: 'BasicShadowMap', desc: 'Sombra dura — mais rápida, menos realista' },
    shadow_pcf: { label: 'PCFShadowMap', desc: 'Percentage Closer Filtering — borda suavizada' },
    shadow_pcfsoft: { label: 'PCFSoftShadowMap', desc: 'PCF com blur extra — sombra mais difusa' },
    shadow_vsm: { label: 'VSMShadowMap', desc: 'Variance Shadow Map — suave mas com bleeding' },
    cast_shadow: { label: 'castShadow', desc: 'O objeto projeta sombra' },
    receive_shadow: { label: 'receiveShadow', desc: 'O objeto recebe sombra de outros' },
    shadow_bias: { label: 'Shadow Bias', desc: 'Corrige artefatos de auto-sombra (acne)' },

    // ── ENVIRONMENT ───────────────────────────────────────────────────────────
    bg_color: { label: 'Background Color', desc: 'Cor de fundo da cena' },
    fog_linear: { label: 'Fog (Linear)', desc: 'Névoa linear — começa e termina em distâncias fixas' },
    fog_exp: { label: 'FogExp2', desc: 'Névoa exponencial — mais densa com a distância' },
    fog_density: { label: 'Fog Density', desc: 'Densidade da névoa exponencial' },
    env_intensity: { label: 'Environment Intensity', desc: 'Força do mapa de ambiente na cena' },

    // ── CAMERA ────────────────────────────────────────────────────────────────
    cam_perspective: { label: 'PerspectiveCamera', desc: 'Projeção cônica — perspectiva humana' },
    cam_ortho: { label: 'OrthographicCamera', desc: 'Projeção paralela — sem distorção de profundidade' },
    cam_fov: { label: 'FOV', desc: 'Field of View — campo de visão em graus' },
    cam_near: { label: 'Near Clip', desc: 'Distância mínima de renderização' },
    cam_far: { label: 'Far Clip', desc: 'Distância máxima de renderização' },

    // ── POST PROCESSING ───────────────────────────────────────────────────────
    bloom: { label: 'Bloom', desc: 'Brilho que vaza em áreas claras — efeito HDR' },
    bloom_threshold: { label: 'Bloom Threshold', desc: 'Luminosidade mínima para acionar o bloom' },
    bloom_strength: { label: 'Bloom Strength', desc: 'Intensidade do efeito de bloom' },
    ssao: { label: 'SSAO', desc: 'Ambient Occlusion em tempo real — escurece frestas' },
    fxaa: { label: 'FXAA', desc: 'Anti-aliasing rápido por pós-processamento' },
    vignette: { label: 'Vignette', desc: 'Escurece as bordas — foco no centro' },
    film_grain: { label: 'Film Grain', desc: 'Ruído visual — imita granulação de filme' },
    chromatic: { label: 'Chromatic Aberration', desc: 'Separação de canais de cor — distorção de lente' },

    // ── RENDERER ──────────────────────────────────────────────────────────────
    tone_linear: { label: 'LinearToneMapping', desc: 'Sem mapeamento — cor direta' },
    tone_reinhard: { label: 'ReinhardToneMapping', desc: 'Compressão suave de altas luzes' },
    tone_cineon: { label: 'CineonToneMapping', desc: 'Curva de filme Kodak — quente' },
    tone_aces: { label: 'ACESFilmicToneMapping', desc: 'Padrão cinematográfico — o mais usado' },
    tone_exposure: { label: 'Exposure', desc: 'Exposição global — clareia ou escurece a cena' },
    pixel_ratio: { label: 'Pixel Ratio', desc: 'Resolução de render relativa ao DPI do monitor' },
}