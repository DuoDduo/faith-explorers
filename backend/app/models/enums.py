import enum


class Role(enum.StrEnum):
    READER = "reader"
    AUTHOR = "author"
    ADMIN = "admin"


class PostStatus(enum.StrEnum):
    DRAFT = "draft"
    PENDING = "pending"
    PUBLISHED = "published"


class CommentStatus(enum.StrEnum):
    VISIBLE = "visible"
    HIDDEN = "hidden"


class ApplicationStatus(enum.StrEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
