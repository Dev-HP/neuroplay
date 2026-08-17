"""NeuroPlay production API.

The public product is educational gameplay software. This module intentionally
keeps clinical diagnosis and treatment claims out of the data model and API.
Adult users authenticate; children are represented by pseudonymous profiles.
"""

from __future__ import annotations

import hashlib
import json
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Any, Callable

import jwt
from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import relationship
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash


UTC = timezone.utc
APP_ENV = os.getenv("APP_ENV", os.getenv("FLASK_ENV", "development")).lower()
IS_PRODUCTION = APP_ENV in {"production", "prod", "staging"}


def _database_url() -> str:
    configured = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URI")
    if configured:
        return configured
    if IS_PRODUCTION:
        raise RuntimeError("DATABASE_URL é obrigatório em produção")
    return "sqlite:///neuroplay-development.db"


def _secret_key() -> str:
    configured = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET")
    if configured and len(configured) >= 32:
        return configured
    if IS_PRODUCTION:
        raise RuntimeError("SECRET_KEY/JWT_SECRET deve ter pelo menos 32 caracteres")
    return "development-only-neuroplay-secret-change-before-deploy-32"


def utc_now() -> datetime:
    return datetime.now(UTC)


app = Flask(__name__)
app.config.update(
    SECRET_KEY=_secret_key(),
    SQLALCHEMY_DATABASE_URI=_database_url(),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SQLALCHEMY_ENGINE_OPTIONS={"pool_pre_ping": True},
    JWT_ACCESS_MINUTES=int(os.getenv("JWT_ACCESS_MINUTES", "15")),
    REFRESH_TOKEN_DAYS=int(os.getenv("REFRESH_TOKEN_DAYS", "30")),
    CONSENT_VERSION=os.getenv("CONSENT_VERSION", "2026-01"),
    MAX_CONTENT_LENGTH=2 * 1024 * 1024,
)

db = SQLAlchemy(app)


def _cors_origins() -> list[str]:
    raw = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,https://dev-hp.github.io",
    )
    return [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]


CORS(
    app,
    origins=_cors_origins(),
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "Idempotency-Key", "X-Organization-ID"],
    methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
)


# ---------------------------------------------------------------------------
# Database model
# ---------------------------------------------------------------------------


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(320), nullable=False, unique=True, index=True)
    senha = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(30), nullable=False, default="educador")
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    email_verificado = db.Column(db.Boolean, nullable=False, default=False)
    data_criacao = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    ultimo_login = db.Column(db.DateTime(timezone=True), nullable=True)

    memberships = relationship("OrganizationMembership", back_populates="user", cascade="all, delete-orphan")
    guardian_links = relationship("GuardianLink", back_populates="guardian", cascade="all, delete-orphan")


class Organization(db.Model):
    __tablename__ = "organizations"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(160), nullable=False)
    slug = db.Column(db.String(180), nullable=False, unique=True, index=True)
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    data_criacao = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    memberships = relationship("OrganizationMembership", back_populates="organization", cascade="all, delete-orphan")
    students = relationship("StudentProfile", back_populates="organization", cascade="all, delete-orphan")


class OrganizationMembership(db.Model):
    __tablename__ = "organization_memberships"
    __table_args__ = (UniqueConstraint("organization_id", "user_id", name="uq_membership_org_user"),)

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    papel = db.Column(db.String(30), nullable=False, default="educador")
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    data_criacao = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    organization = relationship("Organization", back_populates="memberships")
    user = relationship("User", back_populates="memberships")


class StudentProfile(db.Model):
    __tablename__ = "student_profiles"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    apelido = db.Column(db.String(120), nullable=False)
    codigo = db.Column(db.String(40), nullable=False, unique=True, default=lambda: secrets.token_urlsafe(9))
    ano_nascimento = db.Column(db.Integer, nullable=True)
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    data_criacao = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    data_exclusao = db.Column(db.DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="students")
    guardian_links = relationship("GuardianLink", back_populates="student", cascade="all, delete-orphan")
    consents = relationship("Consent", back_populates="student", cascade="all, delete-orphan")
    sessions = relationship("GameSession", back_populates="student", cascade="all, delete-orphan")


class GuardianLink(db.Model):
    __tablename__ = "guardian_links"
    __table_args__ = (UniqueConstraint("student_id", "guardian_id", name="uq_guardian_student"),)

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False)
    guardian_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    papel = db.Column(db.String(30), nullable=False, default="responsavel")
    ativo = db.Column(db.Boolean, nullable=False, default=True)
    data_criacao = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    student = relationship("StudentProfile", back_populates="guardian_links")
    guardian = relationship("User", back_populates="guardian_links")


class Consent(db.Model):
    __tablename__ = "consents"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    guardian_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    finalidade = db.Column(db.String(80), nullable=False, default="gameplay_educacional")
    versao = db.Column(db.String(40), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")
    evidencia = db.Column(db.Text, nullable=True)
    concedido_em = db.Column(db.DateTime(timezone=True), nullable=True)
    revogado_em = db.Column(db.DateTime(timezone=True), nullable=True)
    data_criacao = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    student = relationship("StudentProfile", back_populates="consents")
    guardian = relationship("User")


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), nullable=False, unique=True, index=True)
    nome = db.Column(db.String(120), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    dominio = db.Column(db.String(80), nullable=False)
    dificuldade = db.Column(db.Integer, nullable=False, default=1)
    versao = db.Column(db.String(30), nullable=False, default="1.0.0")
    publicado = db.Column(db.Boolean, nullable=False, default=True)
    data_criacao = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)


class GameSession(db.Model):
    __tablename__ = "game_sessions"
    __table_args__ = (UniqueConstraint("organization_id", "idempotency_key", name="uq_game_session_idempotency"),)

    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(64), nullable=False, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = db.Column(db.Integer, db.ForeignKey("activities.id", ondelete="RESTRICT"), nullable=False)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    idempotency_key = db.Column(db.String(160), nullable=False)
    game_type = db.Column(db.String(80), nullable=False)
    versao_jogo = db.Column(db.String(30), nullable=False, default="1.0.0")
    status = db.Column(db.String(20), nullable=False, default="started")
    score = db.Column(db.Integer, nullable=False, default=0)
    duration_seconds = db.Column(db.Integer, nullable=False, default=0)
    acertos = db.Column(db.Integer, nullable=False, default=0)
    erros = db.Column(db.Integer, nullable=False, default=0)
    accuracy = db.Column(db.Float, nullable=True)
    metadata_json = db.Column(db.JSON, nullable=False, default=dict)
    started_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)
    data_criacao = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    student = relationship("StudentProfile", back_populates="sessions")
    activity = relationship("Activity")
    events = relationship("GameEvent", back_populates="session", cascade="all, delete-orphan")


class GameEvent(db.Model):
    __tablename__ = "game_events"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey("game_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo = db.Column(db.String(60), nullable=False)
    payload_json = db.Column(db.JSON, nullable=False, default=dict)
    ocorrido_em = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    session = relationship("GameSession", back_populates="events")


class RefreshToken(db.Model):
    __tablename__ = "refresh_tokens"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = db.Column(db.String(64), nullable=False, unique=True, index=True)
    expires_at = db.Column(db.DateTime(timezone=True), nullable=False)
    revoked_at = db.Column(db.DateTime(timezone=True), nullable=True)
    user_agent = db.Column(db.String(300), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)

    user = relationship("User")


class AuditEvent(db.Model):
    __tablename__ = "audit_events"

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = db.Column(db.String(80), nullable=False)
    resource_type = db.Column(db.String(80), nullable=False)
    resource_id = db.Column(db.String(120), nullable=True)
    metadata_json = db.Column(db.JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=utc_now)


# Compatibility names for old tests/imports. They point to real product models.
Usuario = User
Aluno = StudentProfile
Atividade = Activity
Progresso = GameSession


# ---------------------------------------------------------------------------
# Common helpers
# ---------------------------------------------------------------------------


def json_error(message: str, status: int = 400, code: str | None = None):
    payload: dict[str, Any] = {"error": message}
    if code:
        payload["code"] = code
    return jsonify(payload), status


def normalize_email(email: Any) -> str:
    return str(email or "").strip().lower()


def slugify(value: str) -> str:
    value = "".join(ch.lower() if ch.isalnum() else "-" for ch in value.strip())
    value = "-".join(part for part in value.split("-") if part)
    return value[:160] or f"org-{secrets.token_hex(4)}"


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def user_payload(user: User) -> dict[str, Any]:
    memberships = [
        {
            "id": membership.organization_id,
            "nome": membership.organization.nome,
            "papel": membership.papel,
        }
        for membership in user.memberships
        if membership.ativo and membership.organization and membership.organization.ativo
    ]
    return {
        "id": user.id,
        "nome": user.nome,
        "email": user.email,
        "tipo": user.tipo,
        "role": user.tipo,
        "organizacoes": memberships,
    }


def issue_access_token(user: User) -> str:
    now = utc_now()
    payload = {
        "sub": str(user.id),
        "user_id": user.id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=app.config["JWT_ACCESS_MINUTES"])).timestamp()),
        "iss": "neuroplay",
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def create_refresh_token(user: User) -> str:
    raw = secrets.token_urlsafe(48)
    db.session.add(
        RefreshToken(
            user_id=user.id,
            token_hash=hash_token(raw),
            expires_at=utc_now() + timedelta(days=app.config["REFRESH_TOKEN_DAYS"]),
            user_agent=request.headers.get("User-Agent", "")[:300],
        )
    )
    return raw


def set_refresh_cookie(response, raw_token: str):
    response.set_cookie(
        "neuroplay_refresh",
        raw_token,
        max_age=app.config["REFRESH_TOKEN_DAYS"] * 86400,
        httponly=True,
        secure=IS_PRODUCTION,
        samesite="None" if IS_PRODUCTION else "Lax",
        path="/api/v1/auth",
    )
    return response


def revoke_refresh(raw_token: str | None):
    if not raw_token:
        return
    stored = RefreshToken.query.filter_by(token_hash=hash_token(raw_token), revoked_at=None).first()
    if stored:
        stored.revoked_at = utc_now()


def audit(action: str, resource_type: str, resource_id: str | None = None, organization_id: int | None = None, metadata: dict[str, Any] | None = None):
    actor = getattr(g, "current_user", None)
    db.session.add(
        AuditEvent(
            organization_id=organization_id,
            actor_user_id=actor.id if actor else None,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata or {},
        )
    )


def require_db_write():
    if not db.engine:
        raise RuntimeError("Database unavailable")


def authenticate_request() -> User | None:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        return None
    raw_token = header.split(" ", 1)[1].strip()
    try:
        payload = jwt.decode(raw_token, app.config["SECRET_KEY"], algorithms=["HS256"], issuer="neuroplay")
        user_id = int(payload["user_id"])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        return None
    user = db.session.get(User, user_id)
    if not user or not user.ativo:
        return None
    return user


def token_required(view: Callable):
    @wraps(view)
    def decorated(*args, **kwargs):
        user = authenticate_request()
        if not user:
            return json_error("Sessão ausente ou expirada", 401, "UNAUTHENTICATED")
        g.current_user = user
        return view(user, *args, **kwargs)

    return decorated


def get_membership(user: User, organization_id: int | None = None) -> OrganizationMembership | None:
    query = OrganizationMembership.query.filter_by(user_id=user.id, ativo=True)
    if organization_id:
        query = query.filter_by(organization_id=organization_id)
    return query.first()


def selected_organization(user: User) -> OrganizationMembership | None:
    raw = request.headers.get("X-Organization-ID") or request.args.get("organization_id")
    try:
        organization_id = int(raw) if raw else None
    except ValueError:
        return None
    return get_membership(user, organization_id)


def can_manage_students(membership: OrganizationMembership | None) -> bool:
    return bool(membership and membership.papel in {"owner", "admin", "educador"})


def student_for_user(user: User, student_id: int) -> tuple[StudentProfile | None, OrganizationMembership | None]:
    student = db.session.get(StudentProfile, student_id)
    if not student or not student.ativo:
        return None, None
    membership = get_membership(user, student.organization_id)
    if membership:
        return student, membership
    guardian = GuardianLink.query.filter_by(student_id=student.id, guardian_id=user.id, ativo=True).first()
    if guardian:
        return student, None
    return None, None


def has_active_consent(student_id: int, purpose: str = "gameplay_educacional") -> bool:
    consent = (
        Consent.query.filter_by(student_id=student_id, finalidade=purpose, status="granted")
        .order_by(Consent.concedido_em.desc())
        .first()
    )
    return bool(consent and not consent.revogado_em)


def activity_payload(activity: Activity) -> dict[str, Any]:
    return {
        "id": activity.id,
        "slug": activity.slug,
        "nome": activity.nome,
        "descricao": activity.descricao,
        "dominio": activity.dominio,
        "dificuldade": activity.dificuldade,
        "versao": activity.versao,
    }


def student_payload(student: StudentProfile, sessions: list[GameSession] | None = None) -> dict[str, Any]:
    sessions = sessions if sessions is not None else []
    completed = [session for session in sessions if session.status == "completed"]
    last_activity = max((session.completed_at for session in completed if session.completed_at), default=None)
    return {
        "id": student.id,
        "nome": student.apelido,
        "apelido": student.apelido,
        "codigo": student.codigo,
        "pontos_totais": sum(session.score for session in completed),
        "nivel": 1 + min(9, len(completed) // 5),
        "jogos_completos": len(completed),
        "ultima_atividade": last_activity.isoformat() if last_activity else None,
        "consentimento_ativo": has_active_consent(student.id),
    }


def session_payload(session: GameSession) -> dict[str, Any]:
    return {
        "id": session.public_id,
        "session_id": session.public_id,
        "student_id": session.student_id,
        "activity_id": session.activity_id,
        "game_type": session.game_type,
        "score": session.score,
        "duration_seconds": session.duration_seconds,
        "acertos": session.acertos,
        "erros": session.erros,
        "accuracy": session.accuracy,
        "status": session.status,
        "started_at": session.started_at.isoformat() if session.started_at else None,
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
    }


def seed_activities() -> None:
    catalog = [
        ("cyber-runner-canvas", "Cyber-Runner", "Corrida com decisões rápidas e obstáculos", "atenção_e_controle_inibitorio"),
        ("echo-temple", "Templo dos Ecos", "Memória visuoespacial e navegação", "memoria_de_trabalho"),
        ("sonic-jump", "Sonic Jump", "Processamento de sons e timing", "processamento_auditivo"),
        ("gravity-lab", "Gravity Lab", "Resolução de problemas e flexibilidade", "flexibilidade_cognitiva"),
        ("mestres-sinal", "Mestres do Sinal", "Respostas a sinais e controle de impulsos", "controle_inibitorio"),
        ("cacador-alvos", "Caçador de Alvos", "Atenção visual e seleção de alvos", "atencao_visual"),
        ("memoria-dupla", "Memória Dupla", "Memória de trabalho visuoespacial", "memoria_de_trabalho"),
    ]
    for slug, nome, descricao, dominio in catalog:
        if not Activity.query.filter_by(slug=slug).first():
            db.session.add(Activity(slug=slug, nome=nome, descricao=descricao, dominio=dominio, dificuldade=1, versao="1.0.0"))
    db.session.commit()


def create_account(data: dict[str, Any]) -> tuple[User, OrganizationMembership]:
    nome = str(data.get("nome") or data.get("name") or "").strip()
    email = normalize_email(data.get("email"))
    senha = str(data.get("senha") or data.get("password") or "")
    if len(nome) < 2 or len(email) < 5 or "@" not in email or len(senha) < 10:
        raise ValueError("Nome, e-mail válido e senha com pelo menos 10 caracteres são obrigatórios")
    if User.query.filter_by(email=email).first():
        raise ValueError("E-mail já cadastrado")

    org_name = str(data.get("organizacao_nome") or data.get("organization_name") or f"Organização de {nome}").strip()
    organization = Organization(nome=org_name[:160], slug=f"{slugify(org_name)}-{secrets.token_hex(3)}")
    user = User(nome=nome[:120], email=email, senha=generate_password_hash(senha), tipo="educador")
    membership = OrganizationMembership(organization=organization, user=user, papel="owner")
    db.session.add_all([organization, user, membership])
    db.session.flush()
    audit("account_created", "user", str(user.id), organization.id, {"role": "owner"})
    db.session.commit()
    return user, membership


def login_account(data: dict[str, Any]):
    email = normalize_email(data.get("email"))
    senha = str(data.get("senha") or data.get("password") or "")
    user = User.query.filter_by(email=email, ativo=True).first()
    if not user or not check_password_hash(user.senha, senha):
        return None
    user.ultimo_login = utc_now()
    access_token = issue_access_token(user)
    refresh_token = create_refresh_token(user)
    audit("login", "user", str(user.id))
    db.session.commit()
    return user, access_token, refresh_token


def _require_json() -> dict[str, Any]:
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


@app.errorhandler(IntegrityError)
def handle_integrity_error(error):
    db.session.rollback()
    app.logger.warning("Integrity error: %s", error.__class__.__name__)
    return json_error("Operação não pôde ser concluída com os dados informados", 409, "CONFLICT")


@app.errorhandler(Exception)
def handle_unexpected_error(error):
    if isinstance(error, (KeyboardInterrupt, SystemExit)):
        raise error
    if isinstance(error, HTTPException):
        return json_error(error.description or "Requisição inválida", error.code or 400, "HTTP_ERROR")
    db.session.rollback()
    app.logger.exception("Unhandled application error")
    return json_error("Erro interno. Tente novamente mais tarde.", 500, "INTERNAL_ERROR")


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------


@app.post("/api/v1/auth/register")
def register_v1():
    data = _require_json()
    try:
        user, membership = create_account(data)
        result = login_account({"email": user.email, "senha": data.get("senha") or data.get("password")})
        if not result:
            return json_error("Conta criada, mas não foi possível iniciar a sessão", 500)
        logged_user, access_token, refresh_token = result
        response = jsonify({"token": access_token, "usuario": user_payload(logged_user), "organization_id": membership.organization_id})
        return set_refresh_cookie(response, refresh_token), 201
    except ValueError as exc:
        db.session.rollback()
        return json_error(str(exc), 400, "VALIDATION_ERROR")


@app.post("/api/v1/auth/login")
def login_v1():
    result = login_account(_require_json())
    if not result:
        return json_error("Credenciais inválidas", 401, "INVALID_CREDENTIALS")
    user, access_token, refresh_token = result
    response = jsonify({"token": access_token, "usuario": user_payload(user)})
    return set_refresh_cookie(response, refresh_token)


@app.post("/api/v1/auth/refresh")
def refresh_v1():
    raw_token = request.cookies.get("neuroplay_refresh") or _require_json().get("refresh_token")
    if not raw_token:
        return json_error("Refresh token ausente", 401, "UNAUTHENTICATED")
    stored = RefreshToken.query.filter_by(token_hash=hash_token(str(raw_token)), revoked_at=None).first()
    if not stored or stored.expires_at <= utc_now() or not stored.user or not stored.user.ativo:
        return json_error("Sessão de renovação inválida", 401, "UNAUTHENTICATED")
    stored.revoked_at = utc_now()
    new_refresh = create_refresh_token(stored.user)
    response = jsonify({"token": issue_access_token(stored.user), "usuario": user_payload(stored.user)})
    db.session.commit()
    return set_refresh_cookie(response, new_refresh)


@app.post("/api/v1/auth/logout")
@token_required
def logout_v1(user: User):
    revoke_refresh(request.cookies.get("neuroplay_refresh") or _require_json().get("refresh_token"))
    audit("logout", "user", str(user.id))
    db.session.commit()
    response = jsonify({"success": True})
    response.delete_cookie("neuroplay_refresh", path="/api/v1/auth")
    return response


@app.get("/api/v1/me")
@token_required
def me_v1(user: User):
    return jsonify({"usuario": user_payload(user)})


# ---------------------------------------------------------------------------
# Organization, student and consent management
# ---------------------------------------------------------------------------


@app.get("/api/v1/organizations")
@token_required
def organizations_v1(user: User):
    return jsonify({"organizations": user_payload(user)["organizacoes"]})


@app.post("/api/v1/organizations")
@token_required
def create_organization_v1(user: User):
    data = _require_json()
    name = str(data.get("nome") or data.get("name") or "").strip()
    if len(name) < 2:
        return json_error("Nome da organização é obrigatório")
    organization = Organization(nome=name[:160], slug=f"{slugify(name)}-{secrets.token_hex(3)}")
    membership = OrganizationMembership(organization=organization, user=user, papel="owner")
    db.session.add_all([organization, membership])
    db.session.flush()
    audit("organization_created", "organization", str(organization.id), organization.id)
    db.session.commit()
    return jsonify({"id": organization.id, "nome": organization.nome, "slug": organization.slug, "papel": "owner"}), 201


@app.get("/api/v1/students")
@token_required
def students_v1(user: User):
    membership = selected_organization(user)
    if not membership:
        return json_error("Organização não selecionada ou não autorizada", 403, "FORBIDDEN")
    students = StudentProfile.query.filter_by(organization_id=membership.organization_id, ativo=True).order_by(StudentProfile.apelido).all()
    payload = []
    for student in students:
        sessions = GameSession.query.filter_by(student_id=student.id, organization_id=membership.organization_id).all()
        payload.append(student_payload(student, sessions))
    return jsonify({"students": payload, "organization_id": membership.organization_id})


@app.post("/api/v1/students")
@token_required
def create_student_v1(user: User):
    membership = selected_organization(user)
    if not can_manage_students(membership):
        return json_error("Usuário não autorizado a criar estudantes", 403, "FORBIDDEN")
    data = _require_json()
    apelido = str(data.get("apelido") or data.get("nome") or "").strip()
    if len(apelido) < 2:
        return json_error("Apelido do estudante é obrigatório")
    year = data.get("ano_nascimento")
    if year is not None:
        try:
            year = int(year)
        except (TypeError, ValueError):
            return json_error("Ano de nascimento inválido")
    student = StudentProfile(organization_id=membership.organization_id, apelido=apelido[:120], ano_nascimento=year)
    db.session.add(student)
    db.session.flush()
    audit("student_created", "student", str(student.id), membership.organization_id)
    db.session.commit()
    return jsonify(student_payload(student)), 201


@app.get("/api/v1/students/<int:student_id>")
@token_required
def get_student_v1(user: User, student_id: int):
    student, _ = student_for_user(user, student_id)
    if not student:
        return json_error("Estudante não encontrado", 404, "NOT_FOUND")
    return jsonify(student_payload(student))


@app.get("/api/v1/students/<int:student_id>/export")
@token_required
def export_student_v1(user: User, student_id: int):
    student, _ = student_for_user(user, student_id)
    if not student:
        return json_error("Estudante não encontrado", 404, "NOT_FOUND")
    sessions = GameSession.query.filter_by(student_id=student.id).order_by(GameSession.data_criacao.asc()).all()
    consents = Consent.query.filter_by(student_id=student.id).order_by(Consent.data_criacao.asc()).all()
    audit("student_exported", "student", str(student.id), student.organization_id)
    db.session.commit()
    return jsonify({
        "student": student_payload(student, sessions),
        "sessions": [session_payload(session) for session in sessions],
        "consents": [{"id": consent.id, "purpose": consent.finalidade, "version": consent.versao, "status": consent.status, "created_at": consent.data_criacao.isoformat()} for consent in consents],
    })


@app.delete("/api/v1/students/<int:student_id>")
@token_required
def delete_student_v1(user: User, student_id: int):
    student, membership = student_for_user(user, student_id)
    if not student or not can_manage_students(membership):
        return json_error("Estudante não encontrado ou operação não autorizada", 404, "NOT_FOUND")
    student.ativo = False
    student.data_exclusao = utc_now()
    audit("student_deletion_requested", "student", str(student.id), student.organization_id)
    db.session.commit()
    return jsonify({"success": True, "student_id": student.id, "status": "deleted"})


@app.post("/api/v1/guardians/link")
@token_required
def link_guardian_v1(user: User):
    membership = selected_organization(user)
    if not can_manage_students(membership):
        return json_error("Usuário não autorizado", 403, "FORBIDDEN")
    data = _require_json()
    student_id = data.get("student_id")
    email = normalize_email(data.get("email"))
    guardian = User.query.filter_by(email=email, ativo=True).first()
    student = db.session.get(StudentProfile, student_id) if student_id else None
    if not guardian or not student or student.organization_id != membership.organization_id:
        return json_error("Estudante ou responsável não encontrado", 404, "NOT_FOUND")
    link = GuardianLink.query.filter_by(student_id=student.id, guardian_id=guardian.id).first()
    if not link:
        link = GuardianLink(student_id=student.id, guardian_id=guardian.id)
        db.session.add(link)
    link.ativo = True
    audit("guardian_linked", "student", str(student.id), membership.organization_id, {"guardian_id": guardian.id})
    db.session.commit()
    return jsonify({"success": True, "student_id": student.id, "guardian_id": guardian.id})


@app.get("/api/v1/consents")
@token_required
def list_consents_v1(user: User):
    student_id = request.args.get("student_id", type=int)
    query = Consent.query
    if student_id:
        student, membership = student_for_user(user, student_id)
        if not student:
            return json_error("Estudante não encontrado", 404, "NOT_FOUND")
        query = query.filter_by(student_id=student.id)
    else:
        memberships = [membership.organization_id for membership in user.memberships if membership.ativo]
        query = query.join(StudentProfile).filter(StudentProfile.organization_id.in_(memberships))
    consents = query.order_by(Consent.data_criacao.desc()).all()
    return jsonify({"consents": [{
        "id": consent.id,
        "student_id": consent.student_id,
        "finalidade": consent.finalidade,
        "versao": consent.versao,
        "status": consent.status,
        "concedido_em": consent.concedido_em.isoformat() if consent.concedido_em else None,
        "revogado_em": consent.revogado_em.isoformat() if consent.revogado_em else None,
    } for consent in consents]})


@app.post("/api/v1/consents")
@token_required
def create_consent_v1(user: User):
    data = _require_json()
    student_id = data.get("student_id")
    student, membership = student_for_user(user, int(student_id)) if student_id else (None, None)
    if not student:
        return json_error("Estudante não encontrado", 404, "NOT_FOUND")
    linked_guardian = GuardianLink.query.filter_by(student_id=student.id, guardian_id=user.id, ativo=True).first()
    if not linked_guardian and not can_manage_students(membership):
        return json_error("Somente responsável vinculado ou gestor autorizado pode registrar consentimento", 403, "FORBIDDEN")
    status = str(data.get("status") or "granted").lower()
    if status not in {"granted", "revoked", "pending"}:
        return json_error("Status de consentimento inválido")
    consent = Consent(
        student_id=student.id,
        guardian_id=user.id,
        finalidade=str(data.get("finalidade") or "gameplay_educacional")[:80],
        versao=str(data.get("versao") or app.config["CONSENT_VERSION"])[:40],
        status=status,
        evidencia=str(data.get("evidencia") or "")[:2000] or None,
        concedido_em=utc_now() if status == "granted" else None,
        revogado_em=utc_now() if status == "revoked" else None,
    )
    db.session.add(consent)
    db.session.flush()
    audit("consent_" + status, "consent", str(consent.id), student.organization_id, {"student_id": student.id, "purpose": consent.finalidade})
    db.session.commit()
    return jsonify({"id": consent.id, "student_id": student.id, "status": consent.status, "versao": consent.versao}), 201


@app.post("/api/v1/consents/<int:consent_id>/revoke")
@token_required
def revoke_consent_v1(user: User, consent_id: int):
    consent = db.session.get(Consent, consent_id)
    if not consent:
        return json_error("Consentimento não encontrado", 404, "NOT_FOUND")
    student, membership = student_for_user(user, consent.student_id)
    linked_guardian = GuardianLink.query.filter_by(student_id=consent.student_id, guardian_id=user.id, ativo=True).first()
    if not student or (not can_manage_students(membership) and not linked_guardian):
        return json_error("Operação não autorizada", 403, "FORBIDDEN")
    consent.status = "revoked"
    consent.revogado_em = utc_now()
    audit("consent_revoked", "consent", str(consent.id), student.organization_id, {"student_id": student.id})
    db.session.commit()
    return jsonify({"success": True, "consent_id": consent.id, "status": consent.status})


@app.get("/api/v1/audit-events")
@token_required
def audit_events_v1(user: User):
    membership = selected_organization(user)
    if not membership or membership.papel not in {"owner", "admin"}:
        return json_error("Somente administradores podem consultar auditoria", 403, "FORBIDDEN")
    limit = min(max(request.args.get("limit", 100, type=int), 1), 500)
    events = AuditEvent.query.filter_by(organization_id=membership.organization_id).order_by(AuditEvent.created_at.desc()).limit(limit).all()
    return jsonify({"events": [{
        "id": event.id,
        "action": event.action,
        "resource_type": event.resource_type,
        "resource_id": event.resource_id,
        "created_at": event.created_at.isoformat(),
        "metadata": event.metadata_json,
    } for event in events]})


# ---------------------------------------------------------------------------
# Activities and persisted gameplay
# ---------------------------------------------------------------------------


@app.get("/api/v1/activities")
def activities_v1():
    activities = Activity.query.filter_by(publicado=True).order_by(Activity.nome).all()
    return jsonify({"activities": [activity_payload(activity) for activity in activities]})


def _activity_for_data(data: dict[str, Any]) -> Activity | None:
    activity_id = data.get("activity_id")
    game_type = str(data.get("game_type") or data.get("tipo") or "").strip()
    activity = db.session.get(Activity, int(activity_id)) if activity_id else None
    if not activity and game_type:
        activity = Activity.query.filter_by(slug=game_type).first()
    return activity


def _create_or_get_session(user: User, data: dict[str, Any], complete: bool = False) -> tuple[GameSession | None, str | None, int]:
    membership = selected_organization(user)
    student_id = data.get("student_id") or data.get("aluno_id")
    try:
        student_id = int(student_id)
    except (TypeError, ValueError):
        return None, "student_id é obrigatório", 400
    student, student_membership = student_for_user(user, student_id)
    if not student or (membership and student.organization_id != membership.organization_id):
        return None, "Estudante não encontrado ou não autorizado", 404
    organization_id = student.organization_id
    if not has_active_consent(student.id):
        return None, "Consentimento válido é necessário antes de registrar gameplay", 403
    activity = _activity_for_data(data)
    if not activity:
        return None, "Atividade não encontrada", 404
    idempotency_key = str(request.headers.get("Idempotency-Key") or data.get("session_id") or data.get("idempotency_key") or "").strip()
    if len(idempotency_key) < 8:
        return None, "Idempotency-Key ou session_id é obrigatório", 400
    existing = GameSession.query.filter_by(organization_id=organization_id, idempotency_key=idempotency_key).first()
    if existing:
        return existing, None, 200
    session = GameSession(
        organization_id=organization_id,
        student_id=student.id,
        activity_id=activity.id,
        created_by_user_id=user.id,
        idempotency_key=idempotency_key[:160],
        game_type=activity.slug,
        versao_jogo=str(data.get("versao_jogo") or activity.versao)[:30],
        status="started",
        metadata_json=data.get("metadata") if isinstance(data.get("metadata"), dict) else {},
    )
    db.session.add(session)
    db.session.flush()
    if complete:
        _complete_session(session, data)
    audit("game_session_created", "game_session", session.public_id, organization_id, {"activity": activity.slug})
    return session, None, 201


def _complete_session(session: GameSession, data: dict[str, Any]) -> None:
    if session.status == "completed":
        return
    def as_int(name: str, default: int = 0) -> int:
        try:
            return max(0, int(data.get(name, default)))
        except (TypeError, ValueError):
            return default
    session.score = as_int("score", data.get("pontos", 0))
    session.duration_seconds = as_int("duration_seconds", data.get("tempo_gasto", 0))
    session.acertos = as_int("acertos", 0)
    session.erros = as_int("erros", 0)
    total = session.acertos + session.erros
    session.accuracy = round(session.acertos / total, 4) if total else None
    session.status = "completed"
    session.completed_at = utc_now()
    events = data.get("events") if isinstance(data.get("events"), list) else []
    for event in events[:200]:
        if isinstance(event, dict) and event.get("type"):
            payload = event.get("data") if isinstance(event.get("data"), dict) else {}
            db.session.add(GameEvent(session_id=session.id, tipo=str(event["type"])[:60], payload_json=payload))


@app.post("/api/v1/gameplay/sessions")
@token_required
def create_game_session_v1(user: User):
    session, error, status = _create_or_get_session(user, _require_json(), complete=False)
    if error:
        return json_error(error, status)
    db.session.commit()
    return jsonify(session_payload(session)), status


@app.post("/api/v1/gameplay/sessions/<public_id>/complete")
@token_required
def complete_game_session_v1(user: User, public_id: str):
    session = GameSession.query.filter_by(public_id=public_id).first()
    if not session:
        return json_error("Sessão não encontrada", 404, "NOT_FOUND")
    student, _ = student_for_user(user, session.student_id)
    if not student:
        return json_error("Sessão não autorizada", 403, "FORBIDDEN")
    _complete_session(session, _require_json())
    audit("game_session_completed", "game_session", session.public_id, session.organization_id, {"status": session.status})
    db.session.commit()
    return jsonify(session_payload(session))


@app.post("/api/v1/gameplay/sync")
@token_required
def sync_gameplay_v1(user: User):
    data = _require_json()
    session, error, status = _create_or_get_session(user, data, complete=True)
    if error:
        return json_error(error, status)
    db.session.commit()
    return jsonify({"success": True, "processing": "completed", "session": session_payload(session)}), status if status != 200 else 200


@app.get("/api/v1/gameplay/sessions/<public_id>/status")
@token_required
def game_session_status_v1(user: User, public_id: str):
    session = GameSession.query.filter_by(public_id=public_id).first()
    if not session:
        return json_error("Sessão não encontrada", 404, "NOT_FOUND")
    student, _ = student_for_user(user, session.student_id)
    if not student:
        return json_error("Sessão não autorizada", 403, "FORBIDDEN")
    return jsonify({"status": session.status, "session_id": session.public_id, "result": session_payload(session)})


@app.get("/api/v1/students/<int:student_id>/progress")
@token_required
def progress_v1(user: User, student_id: int):
    student, _ = student_for_user(user, student_id)
    if not student:
        return json_error("Estudante não encontrado", 404, "NOT_FOUND")
    sessions = GameSession.query.filter_by(student_id=student.id).order_by(GameSession.data_criacao.desc()).all()
    return jsonify({
        "student": student_payload(student, sessions),
        "sessions": [session_payload(session) for session in sessions],
    })


# ---------------------------------------------------------------------------
# Compatibility routes for the existing frontend during migration
# ---------------------------------------------------------------------------


@app.post("/api/auth/register")
def register_legacy():
    response = register_v1()
    return response


@app.post("/api/auth/login")
def login_legacy():
    return login_v1()


@app.get("/api/alunos")
@token_required
def students_legacy(user: User):
    response = students_v1(user)
    if isinstance(response, tuple):
        return response
    data = response.get_json() or {}
    return jsonify(data.get("students", []))


@app.post("/api/alunos")
@token_required
def create_student_legacy(user: User):
    response = create_student_v1(user)
    return response


@app.get("/api/progresso/<int:aluno_id>")
@token_required
def progress_legacy(user: User, aluno_id: int):
    response = progress_v1(user, aluno_id)
    if isinstance(response, tuple):
        return response
    data = response.get_json() or {}
    return jsonify([{
        "atividade_id": session["activity_id"],
        "pontos": session["score"],
        "tempo_gasto": session["duration_seconds"],
        "acertos": session["acertos"],
        "erros": session["erros"],
        "data": session["completed_at"],
    } for session in data.get("sessions", [])])


@app.post("/api/progresso")
@token_required
def save_progress_legacy(user: User):
    data = _require_json()
    if not data.get("session_id"):
        data["session_id"] = f"legacy-{uuid.uuid4()}"
    return sync_gameplay_v1(user)


@app.get("/api/atividades")
def activities_legacy():
    response = activities_v1()
    data = response.get_json() or {}
    return jsonify([{
        "id": activity["id"],
        "nome": activity["nome"],
        "tipo": activity["slug"],
        "descricao": activity["descricao"],
        "dificuldade": activity["dificuldade"],
    } for activity in data.get("activities", [])])


# ---------------------------------------------------------------------------
# Health and telemetry
# ---------------------------------------------------------------------------


@app.get("/health")
def health_check():
    checks: dict[str, Any] = {"database": "unknown", "status": "unknown", "environment": APP_ENV}
    try:
        db.session.execute(text("SELECT 1"))
        checks["database"] = "ok"
        checks["status"] = "healthy"
        return jsonify(checks), 200
    except Exception as exc:
        app.logger.warning("Database health failed: %s", exc.__class__.__name__)
        checks["database"] = "unhealthy"
        checks["status"] = "unhealthy"
        return jsonify(checks), 503


@app.get("/api/v1/health")
def api_health_check():
    return jsonify({"status": "healthy", "version": "3.0.0", "api": "v1", "environment": APP_ENV}), 200


try:
    from telemetry_service import TelemetryService

    def get_telemetry_db():
        import sqlite3
        return sqlite3.connect(os.getenv("TELEMETRY_DB_PATH", "telemetry.db"))

    telemetry_service = TelemetryService(get_telemetry_db())
except Exception as telemetry_import_error:  # pragma: no cover - optional legacy module
    telemetry_service = None
    app.logger.warning("Telemetry service unavailable: %s", telemetry_import_error.__class__.__name__)


@app.post("/api/telemetry/batch")
@token_required
def telemetry_batch(user: User):
    if telemetry_service is None:
        return json_error("Telemetria indisponível", 503, "SERVICE_UNAVAILABLE")
    data = _require_json()
    events = data.get("events") if isinstance(data.get("events"), list) else []
    if not events:
        return json_error("Nenhum evento fornecido")
    # Do not accept identity fields from the client as authorization metadata.
    sanitized = [{"type": str(event.get("type", "unknown"))[:60], "data": event.get("data", {})} for event in events if isinstance(event, dict)]
    result = telemetry_service.process_batch(sanitized)
    audit("telemetry_batch", "telemetry", metadata={"count": len(sanitized)})
    db.session.commit()
    return jsonify(result), 200 if result.get("success") else 500


@app.get("/api/telemetry/session/<session_id>")
@token_required
def get_session_summary(user: User, session_id: str):
    if telemetry_service is None:
        return json_error("Telemetria indisponível", 503, "SERVICE_UNAVAILABLE")
    summary = telemetry_service.get_session_summary(session_id)
    if "error" in summary:
        return jsonify(summary), 404
    return jsonify(summary), 200


@app.cli.command("init-db")
def init_db_command():
    """Create tables and publish the non-personal activity catalog."""
    with app.app_context():
        db.create_all()
        seed_activities()
        print("Banco inicializado e catálogo de atividades publicado.")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        if not IS_PRODUCTION:
            seed_activities()
    app.run(debug=APP_ENV == "development", port=int(os.getenv("PORT", "5000")))
