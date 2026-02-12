from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = 'neuroplay-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///neuroplay.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db = SQLAlchemy(app)

# Models
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'educador' ou 'aluno'
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

class Aluno(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    educador_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    pontos_totais = db.Column(db.Integer, default=0)
    nivel = db.Column(db.Integer, default=1)

class Atividade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    tipo = db.Column(db.String(50))  # 'mestres_sinal', 'quebra_cabeca', 'memoria'
    descricao = db.Column(db.Text)
    dificuldade = db.Column(db.Integer, default=1)

class Progresso(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    aluno_id = db.Column(db.Integer, db.ForeignKey('aluno.id'))
    atividade_id = db.Column(db.Integer, db.ForeignKey('atividade.id'))
    pontos = db.Column(db.Integer, default=0)
    tempo_gasto = db.Column(db.Integer)  # em segundos
    acertos = db.Column(db.Integer, default=0)
    erros = db.Column(db.Integer, default=0)
    data_realizacao = db.Column(db.DateTime, default=datetime.utcnow)

# Token decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token ausente'}), 401
        try:
            data = jwt.decode(token.split()[1], app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = Usuario.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token inválido'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['senha'])
    
    novo_usuario = Usuario(
        nome=data['nome'],
        email=data['email'],
        senha=hashed_password,
        tipo=data['tipo']
    )
    
    db.session.add(novo_usuario)
    db.session.commit()
    
    if data['tipo'] == 'aluno':
        novo_aluno = Aluno(usuario_id=novo_usuario.id)
        db.session.add(novo_aluno)
        db.session.commit()
    
    return jsonify({'message': 'Usuário criado com sucesso'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    usuario = Usuario.query.filter_by(email=data['email']).first()
    
    if usuario and check_password_hash(usuario.senha, data['senha']):
        token = jwt.encode({
            'user_id': usuario.id,
            'tipo': usuario.tipo,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'token': token,
            'usuario': {
                'id': usuario.id,
                'nome': usuario.nome,
                'tipo': usuario.tipo
            }
        })
    
    return jsonify({'message': 'Credenciais inválidas'}), 401

@app.route('/api/alunos', methods=['GET'])
@token_required
def get_alunos(current_user):
    if current_user.tipo != 'educador':
        return jsonify({'message': 'Acesso negado'}), 403
    
    alunos = db.session.query(Aluno, Usuario).join(Usuario).filter(
        Aluno.educador_id == current_user.id
    ).all()
    
    resultado = [{
        'id': aluno.id,
        'nome': usuario.nome,
        'pontos_totais': aluno.pontos_totais,
        'nivel': aluno.nivel
    } for aluno, usuario in alunos]
    
    return jsonify(resultado)

@app.route('/api/progresso/<int:aluno_id>', methods=['GET'])
@token_required
def get_progresso(current_user, aluno_id):
    progressos = Progresso.query.filter_by(aluno_id=aluno_id).all()
    
    resultado = [{
        'atividade_id': p.atividade_id,
        'pontos': p.pontos,
        'tempo_gasto': p.tempo_gasto,
        'acertos': p.acertos,
        'erros': p.erros,
        'data': p.data_realizacao.isoformat()
    } for p in progressos]
    
    return jsonify(resultado)

@app.route('/api/progresso', methods=['POST'])
@token_required
def salvar_progresso(current_user):
    data = request.get_json()
    
    novo_progresso = Progresso(
        aluno_id=data['aluno_id'],
        atividade_id=data['atividade_id'],
        pontos=data['pontos'],
        tempo_gasto=data['tempo_gasto'],
        acertos=data.get('acertos', 0),
        erros=data.get('erros', 0)
    )
    
    db.session.add(novo_progresso)
    
    # Atualizar pontos totais do aluno
    aluno = Aluno.query.get(data['aluno_id'])
    aluno.pontos_totais += data['pontos']
    
    db.session.commit()
    
    return jsonify({'message': 'Progresso salvo com sucesso'}), 201

@app.route('/api/atividades', methods=['GET'])
def get_atividades():
    atividades = Atividade.query.all()
    resultado = [{
        'id': a.id,
        'nome': a.nome,
        'tipo': a.tipo,
        'descricao': a.descricao,
        'dificuldade': a.dificuldade
    } for a in atividades]
    
    return jsonify(resultado)

# ============================================
# HEALTH CHECK ENDPOINT (Para CI/CD e K8s)
# ============================================

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint para Kubernetes/Docker/CI-CD
    Verifica status de todos os serviços críticos
    """
    checks = {
        'database': 'unknown',
        'status': 'unknown'
    }
    
    # Check database
    try:
        db.session.execute('SELECT 1')
        checks['database'] = 'ok'
        checks['status'] = 'healthy'
        status_code = 200
    except Exception as e:
        checks['database'] = f'error: {str(e)}'
        checks['status'] = 'unhealthy'
        status_code = 503
    
    return jsonify(checks), status_code


@app.route('/api/v1/health', methods=['GET'])
def api_health_check():
    """Health check para API v1"""
    return jsonify({
        'status': 'healthy',
        'version': '2.5.0',
        'api': 'v1'
    }), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)


# ============================================
# ENDPOINTS DE TELEMETRIA - NEUROPLAY 2.0
# ============================================

from telemetry_service import TelemetryService
import sqlite3

# Inicializa serviço de telemetria
def get_telemetry_db():
    """Conexão com banco de telemetria"""
    conn = sqlite3.connect('telemetry.db')
    return conn

telemetry_service = TelemetryService(get_telemetry_db())

@app.route('/api/telemetry/batch', methods=['POST'])
def telemetry_batch():
    """
    Recebe lote de eventos de telemetria
    POST /api/telemetry/batch
    Body: { "events": [...] }
    """
    try:
        data = request.get_json()
        events = data.get('events', [])
        
        if not events:
            return jsonify({'error': 'Nenhum evento fornecido'}), 400
        
        result = telemetry_service.process_batch(events)
        
        return jsonify(result), 200 if result['success'] else 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/telemetry/session/<session_id>', methods=['GET'])
def get_session_summary(session_id):
    """
    Retorna resumo de uma sessão específica
    GET /api/telemetry/session/<session_id>
    """
    try:
        summary = telemetry_service.get_session_summary(session_id)
        
        if 'error' in summary:
            return jsonify(summary), 404
        
        return jsonify(summary), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/telemetry/progress/<int:user_id>/<game_module>', methods=['GET'])
def get_user_progress(user_id, game_module):
    """
    Retorna progresso do usuário em um módulo
    GET /api/telemetry/progress/<user_id>/<game_module>
    """
    try:
        progress = telemetry_service.get_user_progress(user_id, game_module)
        
        if 'error' in progress:
            return jsonify(progress), 404
        
        return jsonify(progress), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Inicializa tabela de telemetria se não existir
def init_telemetry_db():
    """Cria tabelas de telemetria"""
    conn = get_telemetry_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cognitive_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            game_module TEXT NOT NULL,
            event_type TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            event_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_session_id 
        ON cognitive_events(session_id)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_game_module 
        ON cognitive_events(game_module)
    """)
    
    conn.commit()
    conn.close()

# Inicializa ao startar
with app.app_context():
    init_telemetry_db()
    print("✅ Banco de telemetria inicializado")

# ============================================
# ENDPOINTS DE JOGOS PYGAME
# ============================================

from game_launcher import iniciar_jogo, JOGOS_DISPONIVEIS

@app.route('/api/jogos/pygame/iniciar/<nome_jogo>', methods=['POST'])
@token_required
def iniciar_jogo_pygame(current_user, nome_jogo):
    """
    Inicia um jogo Pygame
    POST /api/jogos/pygame/iniciar/<nome_jogo>
    """
    try:
        if nome_jogo not in JOGOS_DISPONIVEIS:
            return jsonify({
                'error': f'Jogo não encontrado',
                'jogos_disponiveis': list(JOGOS_DISPONIVEIS.keys())
            }), 404
        
        sucesso = iniciar_jogo(nome_jogo)
        
        if sucesso:
            return jsonify({
                'message': f'Jogo {nome_jogo} iniciado com sucesso',
                'jogo': nome_jogo
            }), 200
        else:
            return jsonify({
                'error': 'Erro ao iniciar jogo'
            }), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jogos/pygame/lista', methods=['GET'])
def listar_jogos_pygame():
    """
    Lista jogos Pygame disponíveis
    GET /api/jogos/pygame/lista
    """
    jogos = [
        {
            'id': 'cyber-runner',
            'nome': 'Cyber-Runner',
            'descricao': 'Treinamento de Controle Inibitório',
            'modulo': 'Córtex Pré-Frontal',
            'disponivel': True
        },
        {
            'id': 'echo-temple',
            'nome': 'Templo dos Ecos',
            'descricao': 'Memória Visuoespacial',
            'modulo': 'Hipocampo',
            'disponivel': False
        },
        {
            'id': 'sonic-jump',
            'nome': 'Orquestra das Plataformas',
            'descricao': 'Processamento Fonológico',
            'modulo': 'Giro Temporal Superior',
            'disponivel': False
        },
        {
            'id': 'gravity-lab',
            'nome': 'Laboratório de Gravidade',
            'descricao': 'Lógica e Flexibilidade',
            'modulo': 'Córtex Parietal',
            'disponivel': False
        }
    ]
    
    return jsonify(jogos), 200
