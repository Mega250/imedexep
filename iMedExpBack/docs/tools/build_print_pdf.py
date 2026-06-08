import argparse
import html
import math
import re
import textwrap
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image as PdfImage,
    KeepTogether,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents


PROJECT_DIR = Path(__file__).resolve().parents[2]
DOCS_DIR = PROJECT_DIR / "docs" / "es"
UML_DIR = DOCS_DIR / "uml"
DIST_DIR = PROJECT_DIR / "docs" / "dist"
FIGURE_DIR = DIST_DIR / "figures"
DOCUMENTADOR = "Damian Vega Rios"
PDF_FONTS = {
    "normal": "Times-Roman",
    "bold": "Times-Bold",
    "italic": "Times-Italic",
    "bold_italic": "Times-BoldItalic",
}
DOC_FILES = [
    DOCS_DIR / "README.md",
    DOCS_DIR / "01_guia_sistema.md",
    DOCS_DIR / "02_casos_uso.md",
    DOCS_DIR / "03_modelo_analisis.md",
    DOCS_DIR / "04_modelo_diseno.md",
    DOCS_DIR / "05_modelo_implementacion.md",
    DOCS_DIR / "06_modelo_base_datos.md",
    DOCS_DIR / "07_modelo_despliegue.md",
    DOCS_DIR / "08_seguridad_cumplimiento.md",
    DOCS_DIR / "09_ejemplos_frontend.md",
]


class FormalDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if not isinstance(flowable, Paragraph):
            return
        levels = {"H1": 0, "H2": 1, "H3": 2}
        style_name = flowable.style.name
        if style_name in levels:
            self.notify("TOCEntry", (levels[style_name], flowable.getPlainText(), self.page))


def register_pdf_fonts():
    global PDF_FONTS
    fonts = {
        "normal": "C:/Windows/Fonts/times.ttf",
        "bold": "C:/Windows/Fonts/timesbd.ttf",
        "italic": "C:/Windows/Fonts/timesi.ttf",
        "bold_italic": "C:/Windows/Fonts/timesbi.ttf",
    }
    if not all(Path(path).exists() for path in fonts.values()):
        return
    pdfmetrics.registerFont(TTFont("TimesNewRoman", fonts["normal"]))
    pdfmetrics.registerFont(TTFont("TimesNewRoman-Bold", fonts["bold"]))
    pdfmetrics.registerFont(TTFont("TimesNewRoman-Italic", fonts["italic"]))
    pdfmetrics.registerFont(TTFont("TimesNewRoman-BoldItalic", fonts["bold_italic"]))
    pdfmetrics.registerFontFamily(
        "TimesNewRoman",
        normal="TimesNewRoman",
        bold="TimesNewRoman-Bold",
        italic="TimesNewRoman-Italic",
        boldItalic="TimesNewRoman-BoldItalic",
    )
    PDF_FONTS = {
        "normal": "TimesNewRoman",
        "bold": "TimesNewRoman-Bold",
        "italic": "TimesNewRoman-Italic",
        "bold_italic": "TimesNewRoman-BoldItalic",
    }


def load_font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()


def text_size(draw, text, font):
    box = draw.multiline_textbbox((0, 0), text, font=font, spacing=5)
    return box[2] - box[0], box[3] - box[1]


def wrap_text(draw, text, font, width):
    rows = []
    for raw in str(text).replace("\\n", "\n").splitlines() or [""]:
        words = raw.split()
        line = ""
        for word in words:
            candidate = word if not line else f"{line} {word}"
            if text_size(draw, candidate, font)[0] <= width:
                line = candidate
            else:
                if line:
                    rows.append(line)
                if text_size(draw, word, font)[0] <= width:
                    line = word
                else:
                    chunk = ""
                    for char in word:
                        candidate_chunk = chunk + char
                        if text_size(draw, candidate_chunk, font)[0] <= width:
                            chunk = candidate_chunk
                        else:
                            if chunk:
                                rows.append(chunk)
                            chunk = char
                    line = chunk
        if line:
            rows.append(line)
    return "\n".join(rows)


def clean_label(value):
    value = value.strip().strip('"')
    value = value.replace("\\n", "\n")
    value = re.sub(r"\s*<<[^>]+>>", "", value)
    return value


def clean_relation_label(value):
    value = value.strip().strip('"')
    value = value.replace("\\n", "\n")
    return value


def parse_declaration(line):
    pattern = r'^(actor|boundary|control|database|collections|component|file|package|node|artifact|cloud|class|entity|rectangle|usecase|enum)\s+("([^"]+)"|[A-Za-z_][\w.]*)\s*(?:as\s+([A-Za-z_]\w*))?'
    match = re.match(pattern, line.strip())
    if not match:
        return None
    kind = match.group(1)
    label = clean_label(match.group(3) or match.group(2))
    alias = match.group(4) or re.sub(r"\W+", "_", label).strip("_")
    if not alias:
        alias = label
    return kind, label, alias


def collect_blocks(lines, accepted):
    blocks = []
    index = 0
    while index < len(lines):
        declaration = parse_declaration(lines[index])
        if not declaration or declaration[0] not in accepted:
            index += 1
            continue
        kind, label, alias = declaration
        fields = []
        line = lines[index].strip()
        if "{" in line and "}" not in line:
            index += 1
            while index < len(lines) and "}" not in lines[index]:
                field = lines[index].strip()
                if field and field != "--":
                    fields.append(field)
                index += 1
        blocks.append({"kind": kind, "label": label, "alias": alias, "fields": fields[:7]})
        index += 1
    return blocks


def collect_elements(lines, accepted):
    elements = []
    seen = set()
    index = 0
    while index < len(lines):
        declaration = parse_declaration(lines[index])
        if not declaration or declaration[0] not in accepted:
            index += 1
            continue
        kind, label, alias = declaration
        if alias in seen:
            index += 1
            continue
        seen.add(alias)
        fields = []
        if kind in {"class", "entity", "enum"} and "{" in lines[index]:
            index += 1
            while index < len(lines) and "}" not in lines[index]:
                field = lines[index].strip()
                if field and field != "--" and not parse_declaration(field):
                    fields.append(clean_label(field))
                index += 1
        elements.append({"kind": kind, "label": label, "alias": alias, "fields": fields[:8]})
        index += 1
    return elements


def puml_title(lines, fallback):
    for line in lines:
        if line.strip().startswith("title "):
            return line.strip()[6:].strip()
    return fallback


def base_image(title, width, height):
    image = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(image)
    title_font = load_font(42, True)
    draw.rectangle((0, 0, width, 105), fill=(20, 68, 90))
    draw.text((50, 30), title, fill="white", font=title_font)
    return image, draw


def draw_box(draw, xy, text, font, fill, outline=(42, 86, 112), radius=18, width=3):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)
    wrapped = wrap_text(draw, text, font, max(20, x2 - x1 - 24))
    tw, th = text_size(draw, wrapped, font)
    draw.multiline_text((x1 + (x2 - x1 - tw) / 2, y1 + (y2 - y1 - th) / 2), wrapped, fill=(16, 36, 50), font=font, align="center", spacing=5)


def draw_actor(draw, center, label, font):
    x, y = center
    draw.ellipse((x - 18, y - 62, x + 18, y - 26), outline=(16, 36, 50), width=4)
    draw.line((x, y - 26, x, y + 36), fill=(16, 36, 50), width=4)
    draw.line((x - 36, y - 2, x + 36, y - 2), fill=(16, 36, 50), width=4)
    draw.line((x, y + 36, x - 34, y + 84), fill=(16, 36, 50), width=4)
    draw.line((x, y + 36, x + 34, y + 84), fill=(16, 36, 50), width=4)
    wrapped = wrap_text(draw, label, font, 210)
    tw, _ = text_size(draw, wrapped, font)
    draw.multiline_text((x - tw / 2, y + 96), wrapped, fill=(16, 36, 50), font=font, align="center", spacing=4)


def parse_relations(lines, aliases):
    relations = []
    arrows = ("--|>", "<|--", "..|>", "<|..", "..>", "<..", "-->", "<--", "->", "<-", "||--", "--o", "o--", "--", "..")
    alias_pattern = r"\b[A-Za-z_][A-Za-z0-9_]*\b"
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith(("skinparam", "title ", "@", "hide ", "left ", "autonumber", "alt ", "else ", "end")):
            continue
        arrow = next((item for item in arrows if item in stripped), None)
        if not arrow:
            continue
        left, right = stripped.split(arrow, 1)
        source_tokens = [token for token in re.findall(alias_pattern, left) if token in aliases]
        target_tokens = [token for token in re.findall(alias_pattern, right.split(":", 1)[0]) if token in aliases]
        if not source_tokens or not target_tokens:
            continue
        label = ""
        if ":" in right:
            label = clean_relation_label(right.split(":", 1)[1])
        source = source_tokens[-1]
        target = target_tokens[0]
        direction = "none"
        if "<" in arrow and ">" not in arrow:
            direction = "back"
        elif ">" in arrow:
            direction = "forward"
        relation_type = "association"
        if "|>" in arrow or "<|" in arrow:
            relation_type = "generalization"
        elif ".." in arrow:
            relation_type = "dependency"
        elif "o" in arrow or "{" in arrow or "|" in arrow:
            relation_type = "aggregation"
        relations.append({
            "source": source,
            "target": target,
            "arrow": arrow,
            "label": label,
            "direction": direction,
            "type": relation_type,
            "dashed": ".." in arrow,
        })
    return relations


def draw_light_relation(draw, relation, centers, boxes):
    source = relation["source"]
    target = relation["target"]
    if source not in centers or target not in centers:
        return
    start_center = centers[source]
    end_center = centers[target]
    start = point_on_box(start_center, end_center, boxes[source])
    end = point_on_box(end_center, start_center, boxes[target])
    if relation["dashed"]:
        dashed_line(draw, start, end, (182, 202, 212), width=1, dash=12, gap=8)
    else:
        draw.line((start[0], start[1], end[0], end[1]), fill=(190, 208, 217), width=1)


def point_on_box(center, target, box):
    cx, cy = center
    tx, ty = target
    x1, y1, x2, y2 = box
    dx = tx - cx
    dy = ty - cy
    if dx == 0 and dy == 0:
        return cx, cy
    candidates = []
    if dx:
        for x in (x1, x2):
            t = (x - cx) / dx
            y = cy + t * dy
            if t > 0 and y1 <= y <= y2:
                candidates.append((t, x, y))
    if dy:
        for y in (y1, y2):
            t = (y - cy) / dy
            x = cx + t * dx
            if t > 0 and x1 <= x <= x2:
                candidates.append((t, x, y))
    if not candidates:
        return cx, cy
    _, x, y = min(candidates, key=lambda item: item[0])
    return x, y


def dashed_line(draw, start, end, fill, width=2, dash=18, gap=10):
    x1, y1 = start
    x2, y2 = end
    length = math.hypot(x2 - x1, y2 - y1)
    if length == 0:
        return
    ux = (x2 - x1) / length
    uy = (y2 - y1) / length
    distance = 0
    while distance < length:
        segment_end = min(distance + dash, length)
        draw.line((x1 + ux * distance, y1 + uy * distance, x1 + ux * segment_end, y1 + uy * segment_end), fill=fill, width=width)
        distance += dash + gap


def draw_arrowhead(draw, start, end, fill, kind="arrow", width=18):
    x1, y1 = start
    x2, y2 = end
    angle = math.atan2(y2 - y1, x2 - x1)
    if kind == "generalization":
        size = width + 6
        p1 = (x2, y2)
        p2 = (x2 - size * math.cos(angle - 0.38), y2 - size * math.sin(angle - 0.38))
        p3 = (x2 - size * math.cos(angle + 0.38), y2 - size * math.sin(angle + 0.38))
        draw.polygon([p1, p2, p3], outline=fill, fill="white")
        draw.line([p1, p2, p3, p1], fill=fill, width=3)
        return
    p1 = (x2, y2)
    p2 = (x2 - width * math.cos(angle - 0.45), y2 - width * math.sin(angle - 0.45))
    p3 = (x2 - width * math.cos(angle + 0.45), y2 - width * math.sin(angle + 0.45))
    draw.polygon([p1, p2, p3], fill=fill)


def draw_relation(draw, relation, centers, boxes, font, color=(52, 85, 104), base_width=None):
    source = relation["source"]
    target = relation["target"]
    if source not in centers or target not in centers:
        return
    start_center = centers[source]
    end_center = centers[target]
    start = point_on_box(start_center, end_center, boxes[source])
    end = point_on_box(end_center, start_center, boxes[target])
    width = base_width if base_width is not None else 3 if relation["type"] in {"generalization", "dependency"} else 2
    if relation["dashed"]:
        dashed_line(draw, start, end, color, width=width)
    else:
        draw.line((start[0], start[1], end[0], end[1]), fill=color, width=width)
    if relation["direction"] == "forward":
        draw_arrowhead(draw, start, end, color, "generalization" if relation["type"] == "generalization" else "arrow")
    elif relation["direction"] == "back":
        draw_arrowhead(draw, end, start, color, "generalization" if relation["type"] == "generalization" else "arrow")
    label = relation["label"]
    if label:
        mx = (start[0] + end[0]) / 2
        my = (start[1] + end[1]) / 2
        label_text = wrap_text(draw, label, font, 190)
        tw, th = text_size(draw, label_text, font)
        draw.rounded_rectangle((mx - tw / 2 - 8, my - th / 2 - 5, mx + tw / 2 + 8, my + th / 2 + 5), radius=6, fill="white", outline=(206, 220, 226), width=1)
        draw.multiline_text((mx - tw / 2, my - th / 2), label_text, fill=(20, 68, 90), font=font, align="center", spacing=3)


def draw_relation_arrowhead(draw, relation, centers, boxes, color=(121, 148, 163)):
    source = relation["source"]
    target = relation["target"]
    if source not in centers or target not in centers:
        return
    start_center = centers[source]
    end_center = centers[target]
    start = point_on_box(start_center, end_center, boxes[source])
    end = point_on_box(end_center, start_center, boxes[target])
    kind = "generalization" if relation["type"] == "generalization" else "arrow"
    if relation["direction"] == "forward":
        draw_arrowhead(draw, start, end, color, kind, width=13)
    elif relation["direction"] == "back":
        draw_arrowhead(draw, end, start, color, kind, width=13)


def uc_number(label):
    match = re.search(r"UC-\d+", label)
    return match.group(0) if match else label


def draw_label_tag(draw, text, center, font, max_width=260):
    label_text = wrap_text(draw, text, font, max_width)
    tw, th = text_size(draw, label_text, font)
    x, y = center
    draw.rounded_rectangle((x - tw / 2 - 10, y - th / 2 - 5, x + tw / 2 + 10, y + th / 2 + 5), radius=7, fill="white", outline=(187, 205, 214), width=1)
    draw.multiline_text((x - tw / 2, y - th / 2), label_text, fill=(20, 68, 90), font=font, align="center", spacing=3)


def draw_actor_node(draw, xy, label, font):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=12, fill=(248, 252, 253), outline=(68, 112, 135), width=2)
    draw.ellipse((x1 + 16, y1 + 15, x1 + 34, y1 + 33), outline=(16, 36, 50), width=2)
    draw.line((x1 + 25, y1 + 33, x1 + 25, y1 + 60), fill=(16, 36, 50), width=2)
    draw.line((x1 + 10, y1 + 43, x1 + 40, y1 + 43), fill=(16, 36, 50), width=2)
    draw.line((x1 + 25, y1 + 60, x1 + 12, y1 + 76), fill=(16, 36, 50), width=2)
    draw.line((x1 + 25, y1 + 60, x1 + 38, y1 + 76), fill=(16, 36, 50), width=2)
    text = wrap_text(draw, label, font, x2 - x1 - 70)
    tw, th = text_size(draw, text, font)
    draw.multiline_text((x1 + 56, y1 + (y2 - y1 - th) / 2), text, fill=(16, 36, 50), font=font, spacing=3)


def draw_association_matrix(draw, actors, associations, x1, y1, x2, y2, title_font, font):
    draw.rounded_rectangle((x1, y1, x2, y2), radius=18, fill=(248, 252, 253), outline=(177, 201, 213), width=2)
    draw.text((x1 + 24, y1 + 18), "Matriz de asociacion actor-caso", fill=(20, 68, 90), font=title_font)
    cols = 4
    card_gap = 18
    card_w = (x2 - x1 - 48 - card_gap * (cols - 1)) / cols
    card_h = 122
    start_y = y1 + 70
    for idx, actor in enumerate(actors):
        col = idx % cols
        row = idx // cols
        cx1 = x1 + 24 + col * (card_w + card_gap)
        cy1 = start_y + row * (card_h + 16)
        cx2 = cx1 + card_w
        cy2 = cy1 + card_h
        draw.rounded_rectangle((cx1, cy1, cx2, cy2), radius=12, fill="white", outline=(199, 216, 224), width=1)
        draw.text((cx1 + 14, cy1 + 12), actor["label"].replace("\n", " "), fill=(20, 68, 90), font=title_font)
        values = ", ".join(associations.get(actor["alias"], []))
        text = wrap_text(draw, values or "Sin asociaciones directas", font, card_w - 28)
        draw.multiline_text((cx1 + 14, cy1 + 48), text, fill=(24, 47, 59), font=font, spacing=3)


def draw_usecase_dependency(draw, relation, centers, boxes, font):
    source = relation["source"]
    target = relation["target"]
    if source not in centers or target not in centers:
        return
    sx1, sy1, sx2, sy2 = boxes[source]
    tx1, ty1, tx2, ty2 = boxes[target]
    source_center = centers[source]
    target_center = centers[target]
    if abs(source_center[1] - target_center[1]) < 14:
        start = (source_center[0], sy1)
        end = (target_center[0], ty1)
        lane = min(sy1, ty1) - 38
        points = [start, (start[0], lane), (end[0], lane), end]
        label_pos = ((start[0] + end[0]) / 2, lane - 18)
        draw_polyline_arrow(draw, points, font, relation["label"], label_pos, dashed=True)
        return
    start = point_on_box(source_center, target_center, boxes[source])
    end = point_on_box(target_center, source_center, boxes[target])
    mid_y = min(start[1], end[1]) - 46
    points = [start, (start[0], mid_y), (end[0], mid_y), end]
    draw_polyline_arrow(draw, points, font, relation["label"], ((start[0] + end[0]) / 2, mid_y - 18), dashed=True)


def draw_usecase(path, lines, output):
    title = puml_title(lines, path.stem)
    image, draw = base_image(title, 3000, 2100)
    font = load_font(27)
    small = load_font(21)
    label_font = load_font(22, True)
    section_font = load_font(24, True)
    actor_font = load_font(18)
    actors = collect_elements(lines, {"actor"})
    usecases = collect_elements(lines, {"usecase"})
    centers = {}
    boxes = {}
    system_box = (70, 155, 2180, 1425)
    draw.rounded_rectangle(system_box, radius=28, fill=(248, 252, 253), outline=(74, 121, 145), width=4)
    draw.text((120, 195), "iMedExp Backend", fill=(20, 68, 90), font=load_font(34, True))
    cols = 4
    box_w = 455
    box_h = 108
    start_x = 145
    start_y = 300
    gap_x = 45
    gap_y = 48
    order = [
        "UC02", "UC01", "UC04", "UC03",
        "UC05", "UC06", "UC07", "UC08",
        "UC09", "UC10", "UC11", "UC12",
        "UC14", "UC13", "UC16", "UC15",
        "UC19", "UC20", "UC21", "UC17",
        "UC18", "UC22", "UC23", "UC24",
    ]
    by_alias = {item["alias"]: item for item in usecases}
    ordered = [by_alias[item] for item in order if item in by_alias]
    ordered.extend(item for item in usecases if item["alias"] not in {case["alias"] for case in ordered})
    for idx, usecase in enumerate(ordered):
        col = idx % cols
        row = idx // cols
        x = start_x + col * (box_w + gap_x)
        y = start_y + row * (box_h + gap_y)
        centers[usecase["alias"]] = (x + box_w / 2, y + box_h / 2)
        boxes[usecase["alias"]] = (x, y, x + box_w, y + box_h)
    aliases = set(centers)
    actor_aliases = {actor["alias"] for actor in actors}
    aliases.update(actor_aliases)
    relations = parse_relations(lines, aliases)
    usecase_aliases = {usecase["alias"] for usecase in usecases}
    associations = {actor["alias"]: [] for actor in actors}
    for relation in relations:
        source = relation["source"]
        target = relation["target"]
        if {source, target} & actor_aliases and {source, target} & usecase_aliases:
            actor = source if source in actor_aliases else target
            usecase = target if target in usecase_aliases else source
            associations.setdefault(actor, []).append(uc_number(by_alias.get(usecase, {"label": usecase})["label"]))
    for idx, usecase in enumerate(ordered):
        box = boxes[usecase["alias"]]
        draw_box(draw, box, usecase["label"], font, (230, 244, 249), radius=54, width=3)
    for relation in relations:
        source = relation["source"]
        target = relation["target"]
        if source in usecase_aliases and target in usecase_aliases:
            draw_usecase_dependency(draw, relation, centers, boxes, label_font)
    actor_panel = (2240, 155, 2930, 1425)
    draw.rounded_rectangle(actor_panel, radius=22, fill=(248, 252, 253), outline=(177, 201, 213), width=2)
    draw.text((2265, 190), "Generalizacion de actores", fill=(20, 68, 90), font=section_font)
    actor_positions = {
        "UsuarioAut": (2470, 285, 2710, 375),
        "StaffAut": (2470, 560, 2710, 650),
        "Paciente": (2290, 560, 2450, 650),
        "Doctor": (2268, 815, 2448, 910),
        "Secretaria": (2488, 815, 2668, 910),
        "AdminInst": (2700, 815, 2915, 910),
        "Superadmin": (2268, 1058, 2468, 1148),
        "Observabilidad": (2425, 1268, 2755, 1360),
    }
    actor_centers = {}
    actor_boxes = {}
    actor_by_alias = {actor["alias"]: actor for actor in actors}
    for alias, box in actor_positions.items():
        if alias not in actor_by_alias:
            continue
        actor_boxes[alias] = box
        actor_centers[alias] = ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)
    for relation in relations:
        if relation["type"] == "generalization" and relation["source"] in actor_centers and relation["target"] in actor_centers:
            draw_relation(draw, relation, actor_centers, actor_boxes, actor_font)
    for alias, box in actor_positions.items():
        if alias in actor_by_alias:
            draw_actor_node(draw, box, actor_by_alias[alias]["label"], actor_font)
    draw_label_tag(draw, "triangulo abierto = herencia / especializacion", (2585, 440), actor_font, 360)
    matrix_actors = [actor for actor in actors if actor["alias"] not in {"UsuarioAut", "StaffAut"}]
    draw_association_matrix(draw, matrix_actors, associations, 70, 1485, 2930, 1965, section_font, small)
    draw.rounded_rectangle((70, 1985, 2930, 2060), radius=12, fill="white", outline=(183, 202, 211), width=2)
    draw.text((95, 2007), "Notacion: asociacion actor-caso en matriz, dependencia dirigida con flecha, <<include>> y <<extend>> en linea discontinua, generalizacion/herencia con triangulo abierto.", fill=(20, 68, 90), font=label_font)
    image.save(output)


def draw_component_card(draw, xy, text, font, fill=(230, 244, 249), outline=(58, 98, 119)):
    x1, y1, x2, y2 = xy
    draw.rounded_rectangle(xy, radius=16, fill=fill, outline=outline, width=3)
    draw.rectangle((x1 + 16, y1 + 18, x1 + 44, y1 + 44), outline=outline, width=3)
    draw.rectangle((x1 + 8, y1 + 28, x1 + 22, y1 + 42), fill=fill, outline=outline, width=2)
    wrapped = wrap_text(draw, text, font, x2 - x1 - 78)
    tw, th = text_size(draw, wrapped, font)
    draw.multiline_text((x1 + 58, y1 + (y2 - y1 - th) / 2), wrapped, fill=(16, 36, 50), font=font, spacing=4)


def draw_polyline_arrow(draw, points, font, label="", label_pos=None, color=(35, 74, 93), width=4, dashed=False):
    for start, end in zip(points, points[1:]):
        if dashed:
            dashed_line(draw, start, end, color, width=width, dash=18, gap=10)
        else:
            draw.line((start[0], start[1], end[0], end[1]), fill=color, width=width)
    draw_arrowhead(draw, points[-2], points[-1], color, width=20)
    if label:
        if label_pos is None:
            label_pos = ((points[0][0] + points[-1][0]) / 2, (points[0][1] + points[-1][1]) / 2)
        draw_label_tag(draw, label, label_pos, font, 260)


def draw_component_architecture(path, lines, output):
    title = puml_title(lines, path.stem)
    image, draw = base_image(title, 2600, 1500)
    font = load_font(25, True)
    small = load_font(21, True)
    app_box = (410, 180, 2170, 1225)
    draw.rounded_rectangle(app_box, radius=28, fill=(248, 252, 253), outline=(74, 121, 145), width=4)
    draw.rectangle((410, 180, 2170, 260), fill=(232, 244, 249), outline=(74, 121, 145), width=0)
    draw.text((455, 207), "FastAPI Application  app/main.py", fill=(20, 68, 90), font=load_font(31, True))
    cards = {
        "Client": (70, 385, 335, 505),
        "Prometheus": (70, 905, 335, 1025),
        "Middleware": (520, 330, 890, 455),
        "Routers": (1030, 330, 1400, 455),
        "Deps": (1540, 330, 1910, 455),
        "Schemas": (1540, 545, 1910, 670),
        "Services": (1030, 735, 1400, 860),
        "Repositories": (1540, 735, 1910, 860),
        "Models": (1540, 950, 1910, 1075),
        "Metrics": (520, 950, 890, 1075),
        "Email": (2265, 475, 2530, 610),
        "DB": (2235, 800, 2555, 945),
        "SQL": (2235, 1065, 2555, 1200),
    }
    labels = {item["alias"]: item["label"] for item in collect_elements(lines, {"actor", "collections", "component", "database", "file"})}
    fills = {
        "Client": (242, 238, 250),
        "Prometheus": (242, 238, 250),
        "Email": (250, 244, 230),
        "DB": (237, 246, 232),
        "SQL": (250, 244, 230),
    }
    for alias, box in cards.items():
        draw_component_card(draw, box, labels.get(alias, alias), font, fills.get(alias, (230, 244, 249)))
    connectors = [
        ([(335, 445), (520, 445)], "HTTP/JSON", (428, 410)),
        ([(890, 392), (1030, 392)], "", None),
        ([(1400, 392), (1540, 392)], "", None),
        ([(1215, 455), (1215, 608), (1540, 608)], "", None),
        ([(1215, 455), (1215, 735)], "", None),
        ([(1400, 798), (1540, 798)], "", None),
        ([(1725, 860), (1725, 950)], "", None),
        ([(1910, 798), (2075, 798), (2075, 872), (2235, 872)], "SQL parametrizado", (2060, 760)),
        ([(2395, 1065), (2395, 945)], "schemas, RLS, triggers, indexes", (2258, 1005)),
        ([(1215, 735), (1215, 690), (2170, 690), (2170, 542), (2265, 542)], "codigos de verificacion", (1960, 650)),
        ([(335, 965), (520, 965)], "GET /metrics", (430, 928)),
        ([(705, 950), (705, 820), (455, 820), (455, 260)], "instrumenta", (580, 790)),
    ]
    for points, label, label_pos in connectors:
        draw_polyline_arrow(draw, points, small, label, label_pos)
    draw.rounded_rectangle((70, 1280, 2555, 1390), radius=14, fill=(248, 252, 253), outline=(183, 202, 211), width=2)
    draw.text((100, 1302), "Direccion de dependencias", fill=(20, 68, 90), font=load_font(25, True))
    draw_polyline_arrow(draw, [(440, 1338), (660, 1338)], small, "dirigida", (550, 1305))
    draw_polyline_arrow(draw, [(850, 1338), (1070, 1338)], small, "dependencia externa", (960, 1305), dashed=True)
    draw.text((1200, 1322), "Los componentes internos permanecen dentro del limite de la aplicacion; servicios externos y base de datos quedan fuera.", fill=(20, 68, 90), font=load_font(22))
    image.save(output)


def draw_deployment_node(draw, xy, title, font, fill=(248, 252, 253), outline=(58, 98, 119), depth=14, title_y=20):
    x1, y1, x2, y2 = xy
    draw.rectangle((x1, y1, x2, y2), fill=fill, outline=outline, width=3)
    draw.polygon([(x1, y1), (x1 + depth, y1 - depth), (x2 + depth, y1 - depth), (x2, y1)], fill=(255, 255, 255), outline=outline)
    draw.polygon([(x2, y1), (x2 + depth, y1 - depth), (x2 + depth, y2 - depth), (x2, y2)], fill=(238, 246, 249), outline=outline)
    wrapped = wrap_text(draw, title, font, x2 - x1 - 36)
    tw, th = text_size(draw, wrapped, font)
    draw.multiline_text((x1 + (x2 - x1 - tw) / 2, y1 + title_y), wrapped, fill=(16, 36, 50), font=font, align="center", spacing=4)


def draw_deployment_artifact(draw, xy, title, font, fill=(255, 250, 238), outline=(58, 98, 119)):
    x1, y1, x2, y2 = xy
    draw.rectangle(xy, fill=fill, outline=outline, width=3)
    draw.polygon([(x2 - 34, y1), (x2, y1 + 34), (x2 - 34, y1 + 34)], fill=(238, 246, 249), outline=outline)
    wrapped = wrap_text(draw, title, font, x2 - x1 - 42)
    tw, th = text_size(draw, wrapped, font)
    draw.multiline_text((x1 + (x2 - x1 - tw) / 2, y1 + (y2 - y1 - th) / 2), wrapped, fill=(16, 36, 50), font=font, align="center", spacing=4)


def draw_deployment_architecture(path, lines, output):
    title = puml_title(lines, path.stem)
    image, draw = base_image(title, 3000, 1780)
    node_font = load_font(26, True)
    small = load_font(21, True)
    body = load_font(22)
    pale = (248, 252, 253)
    lavender = (244, 241, 250)
    green = (237, 246, 232)
    yellow = (250, 244, 230)
    draw.text((90, 145), "Modelo de despliegue objetivo para produccion", fill=(20, 68, 90), font=load_font(29, True))
    draw_deployment_node(draw, (80, 230, 360, 340), "Internet", node_font, lavender)
    draw_deployment_node(draw, (500, 230, 850, 340), "WAF/CDN\nCloudflare o AWS WAF", small, lavender)
    draw_deployment_node(draw, (1000, 230, 1360, 340), "Ingress Controller\nNGINX/ALB", small, lavender)
    cluster = (600, 420, 2070, 1350)
    draw_deployment_node(draw, cluster, "", node_font, pale, title_y=24)
    draw.text((650, 455), "Kubernetes Cluster", fill=(16, 36, 50), font=node_font)
    namespace = (675, 520, 1995, 1050)
    draw_deployment_node(draw, namespace, "Namespace: imedexp", small, lavender, title_y=18)
    draw_deployment_node(draw, (1080, 610, 1480, 720), "Service: imedexp-api", small, lavender, depth=10, title_y=24)
    deployment = (820, 795, 1740, 990)
    draw_deployment_node(draw, deployment, "Deployment: imedexp-api", small, pale, depth=12, title_y=18)
    draw_deployment_node(draw, (875, 860, 1130, 955), "Pod API #1", body, lavender, depth=9, title_y=10)
    draw_deployment_artifact(draw, (905, 908, 1105, 945), "FastAPI container", body)
    draw_deployment_node(draw, (1215, 860, 1470, 955), "Pod API #N", body, lavender, depth=9, title_y=10)
    draw_deployment_artifact(draw, (1245, 908, 1445, 945), "FastAPI container", body)
    draw_deployment_node(draw, (720, 1095, 1940, 1260), "Recursos Kubernetes de soporte", small, pale, depth=12, title_y=16)
    draw_deployment_node(draw, (760, 1160, 1020, 1230), "ConfigMap", body, lavender, depth=8, title_y=18)
    draw_deployment_node(draw, (1050, 1160, 1310, 1230), "Secret", body, lavender, depth=8, title_y=18)
    draw_deployment_node(draw, (1340, 1160, 1600, 1230), "HPA", body, lavender, depth=8, title_y=18)
    draw_deployment_node(draw, (1630, 1160, 1900, 1230), "NetworkPolicy", body, lavender, depth=8, title_y=18)
    monitoring = (80, 1070, 520, 1500)
    draw_deployment_node(draw, monitoring, "Namespace: monitoring", small, lavender, title_y=18)
    draw_deployment_artifact(draw, (140, 1170, 460, 1250), "Prometheus", small)
    draw_deployment_artifact(draw, (140, 1290, 460, 1370), "Grafana", small)
    draw_deployment_artifact(draw, (140, 1410, 460, 1480), "Alertmanager", small)
    draw_deployment_node(draw, (2260, 470, 2880, 610), "Proveedor SMTP", small, yellow)
    draw_deployment_node(draw, (2260, 720, 2880, 900), "PostgreSQL administrado\nprivado, cifrado, backups", small, green)
    draw_deployment_node(draw, (2260, 1010, 2880, 1150), "Gestor de Secretos\nVault/Cloud Secret Manager", small, lavender)
    draw_deployment_node(draw, (2260, 1275, 2880, 1420), "CI/CD\nGitLab Pipeline", small, lavender)
    draw_polyline_arrow(draw, [(360, 285), (500, 285)], small, "HTTPS", (430, 245))
    draw_polyline_arrow(draw, [(850, 285), (1000, 285)], small, "HTTPS filtrado", (925, 245))
    draw_polyline_arrow(draw, [(1180, 340), (1180, 610)], small, "HTTP interno", (1235, 475))
    draw_polyline_arrow(draw, [(1280, 720), (1280, 795)], small, "balanceo", (1355, 760))
    draw_polyline_arrow(draw, [(1740, 855), (2135, 540), (2260, 540)], small, "envio de correo", (2030, 500))
    draw_polyline_arrow(draw, [(1740, 900), (2135, 810), (2260, 810)], small, "SQL/TLS", (2025, 770))
    draw_polyline_arrow(draw, [(460, 1210), (560, 1210), (560, 665), (1080, 665)], small, "GET /metrics", (585, 920))
    draw_label_tag(draw, "Grafana consulta Prometheus; Prometheus envia alertas a Alertmanager", (300, 1300), body, 360)
    draw_label_tag(draw, "ConfigMap y Secret inyectan configuracion; HPA escala replicas; NetworkPolicy restringe trafico", (1330, 1118), body, 760)
    draw_label_tag(draw, "Secret Manager sincroniza Secrets. CI/CD aplica Helm y migraciones controladas.", (2540, 1218), body, 620)
    draw.rounded_rectangle((80, 1555, 2880, 1688), radius=14, fill=(248, 252, 253), outline=(183, 202, 211), width=2)
    draw.text((110, 1580), "Notacion UML de despliegue", fill=(20, 68, 90), font=load_font(25, True))
    draw.text((110, 1625), "Nodo 3D = dispositivo, servidor, cluster, namespace o recurso ejecutable. Artefacto = componente desplegado. Flecha dirigida = comunicacion o dependencia operacional.", fill=(20, 68, 90), font=body)
    image.save(output)


def parse_sequence(lines):
    participants = []
    aliases = set()
    messages = []
    accepted = {"actor", "boundary", "control", "database"}
    for line in lines:
        declaration = parse_declaration(line)
        if declaration and declaration[0] in accepted:
            kind, label, alias = declaration
            if alias not in aliases:
                participants.append({"kind": kind, "label": label, "alias": alias})
                aliases.add(alias)
            continue
        message = re.match(r"^\s*([A-Za-z_]\w*)\s+(-+>|-->|<-+|<--)\s+([A-Za-z_]\w*)\s*:\s*(.+)$", line)
        if message:
            messages.append(("message", message.group(1), message.group(3), clean_label(message.group(4))))
        else:
            stripped = line.strip()
            if stripped.startswith(("alt ", "else ", "end")):
                messages.append(("block", stripped, "", ""))
    return participants, messages


def draw_sequence(path, lines, output):
    title = puml_title(lines, path.stem)
    participants, messages = parse_sequence(lines)
    width = max(1800, 210 + len(participants) * 250)
    height = max(1200, 260 + len(messages) * 86)
    image, draw = base_image(title, width, height)
    font = load_font(24)
    small = load_font(21)
    top = 180
    left = 110
    step = (width - left * 2) / max(1, len(participants) - 1)
    positions = {}
    for idx, participant in enumerate(participants):
        x = left + idx * step
        positions[participant["alias"]] = x
        draw_box(draw, (x - 95, top, x + 95, top + 86), participant["label"], small, (229, 244, 238), radius=14, width=2)
        draw.line((x, top + 86, x, height - 80), fill=(174, 188, 196), width=2)
    y = top + 145
    for item in messages:
        if item[0] == "block":
            label = item[1]
            if label == "end":
                y += 18
                continue
            draw.rounded_rectangle((70, y - 28, width - 70, y + 34), radius=12, fill=(248, 242, 218), outline=(210, 181, 107), width=2)
            draw.text((92, y - 13), label, fill=(80, 65, 31), font=small)
            y += 70
            continue
        _, source, target, label = item
        if source not in positions or target not in positions:
            y += 76
            continue
        x1 = positions[source]
        x2 = positions[target]
        draw.line((x1, y, x2, y), fill=(35, 74, 93), width=3)
        direction = 1 if x2 >= x1 else -1
        draw.polygon([(x2, y), (x2 - direction * 18, y - 8), (x2 - direction * 18, y + 8)], fill=(35, 74, 93))
        wrapped = wrap_text(draw, label, font, max(160, abs(x2 - x1) - 26))
        tw, th = text_size(draw, wrapped, font)
        draw.rectangle((min(x1, x2) + 8, y - th - 17, min(x1, x2) + 28 + tw, y - 4), fill="white")
        draw.multiline_text((min(x1, x2) + 18, y - th - 14), wrapped, fill=(16, 36, 50), font=font, spacing=4)
        y += 86
    image.save(output)


def draw_grid_diagram(path, lines, output):
    title = puml_title(lines, path.stem)
    priority = {"entity", "class", "enum", "component", "database", "node", "artifact", "package", "file", "collections", "cloud"}
    blocks = collect_elements(lines, priority)
    if not blocks:
        blocks = collect_elements(lines, {"actor", "boundary", "control", "rectangle"})
    count = max(1, len(blocks))
    cols = 5 if count > 18 else 4 if count > 10 else 3 if count > 5 else 2
    box_w = 430
    box_h = 240 if any(block["fields"] for block in blocks) else 155
    gap = 58
    rows = math.ceil(count / cols)
    width = cols * box_w + (cols - 1) * gap + 180
    height = max(900, rows * box_h + (rows - 1) * gap + 240)
    image, draw = base_image(title, width, height)
    font = load_font(25, True)
    field_font = load_font(20)
    label_font = load_font(20, True)
    centers = {}
    box_positions = {}
    for idx, block in enumerate(blocks):
        col = idx % cols
        row = idx // cols
        x = 90 + col * (box_w + gap)
        y = 160 + row * (box_h + gap)
        box_positions[block["alias"]] = (x, y, x + box_w, y + box_h)
        centers[block["alias"]] = (x + box_w / 2, y + box_h / 2)
    aliases = set(centers)
    relations = parse_relations(lines, aliases)
    for relation in relations:
        draw_relation(draw, relation, centers, box_positions, label_font, color=(121, 148, 163), base_width=1)
    for block in blocks:
        x1, y1, x2, y2 = box_positions[block["alias"]]
        fill = (232, 244, 248)
        if block["kind"] in {"entity", "database"}:
            fill = (237, 246, 232)
        elif block["kind"] in {"node", "cloud"}:
            fill = (242, 238, 250)
        elif block["kind"] in {"package", "file", "artifact"}:
            fill = (250, 244, 230)
        draw.rounded_rectangle((x1, y1, x2, y2), radius=18, fill=fill, outline=(62, 99, 119), width=3)
        header_h = 62
        draw.rounded_rectangle((x1, y1, x2, y1 + header_h), radius=18, fill=(55, 105, 130), outline=(55, 105, 130), width=2)
        draw.rectangle((x1, y1 + header_h - 18, x2, y1 + header_h), fill=(55, 105, 130))
        label = wrap_text(draw, block["label"], font, box_w - 30)
        tw, th = text_size(draw, label, font)
        draw.multiline_text((x1 + (box_w - tw) / 2, y1 + (header_h - th) / 2), label, fill="white", font=font, align="center", spacing=4)
        fy = y1 + header_h + 14
        for field in block["fields"]:
            field_text = wrap_text(draw, field.replace("+", "").replace("-", ""), field_font, box_w - 34)
            draw.multiline_text((x1 + 18, fy), field_text, fill=(22, 47, 61), font=field_font, spacing=3)
            fy += text_size(draw, field_text, field_font)[1] + 9
            if fy > y2 - 24:
                break
    for relation in relations:
        draw_relation_arrowhead(draw, relation, centers, box_positions)
    image.save(output)


def generate_figures():
    FIGURE_DIR.mkdir(parents=True, exist_ok=True)
    figure_map = {}
    for path in sorted(UML_DIR.glob("*.puml")):
        lines = path.read_text(encoding="utf-8").splitlines()
        content = "\n".join(lines)
        output = FIGURE_DIR / f"{path.stem}.png"
        if "usecase" in content:
            draw_usecase(path, lines, output)
        elif path.name == "07_implementacion_componentes.puml":
            draw_component_architecture(path, lines, output)
        elif path.name == "10_despliegue.puml":
            draw_deployment_architecture(path, lines, output)
        elif "autonumber" in content or any(parse_declaration(line) and parse_declaration(line)[0] in {"boundary", "control"} for line in lines):
            draw_sequence(path, lines, output)
        else:
            draw_grid_diagram(path, lines, output)
        figure_map[path.name] = output
    return figure_map


def inline_markup(text):
    value = html.escape(text.strip())
    value = re.sub(r"`([^`]+)`", r'<font name="Courier">\1</font>', value)
    value = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", value)
    return value


def is_separator_row(cells):
    return all(re.fullmatch(r":?-{3,}:?", cell.strip()) for cell in cells)


def parse_table(lines, styles, width):
    rows = []
    for line in lines:
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if is_separator_row(cells):
            continue
        cell_style = styles["TableHead"] if not rows else styles["TableCell"]
        rows.append([Paragraph(inline_markup(cell), cell_style) for cell in cells])
    if not rows:
        return []
    col_count = max(len(row) for row in rows)
    for row in rows:
        while len(row) < col_count:
            row.append(Paragraph("", styles["TableCell"]))
    col_widths = [width / col_count] * col_count
    table = Table(rows, colWidths=col_widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
        ("FONTNAME", (0, 0), (-1, 0), PDF_FONTS["bold"]),
        ("FONTNAME", (0, 1), (-1, -1), PDF_FONTS["normal"]),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("LEADING", (0, 0), (-1, -1), 12.75),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.black),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return [Spacer(1, 6), table, Spacer(1, 8)]


def figure_flowables(path, caption, styles, max_width, max_height):
    image = Image.open(path)
    width, height = image.size
    scale = min(max_width / width, max_height / height)
    return [KeepTogether([
        Paragraph(caption, styles["Caption"]),
        Spacer(1, 4),
        PdfImage(str(path), width=width * scale, height=height * scale),
    ]), Spacer(1, 12)]


def extract_figures(text):
    return re.findall(r"([0-9]{2}_[A-Za-z0-9_]+\.puml)", text)


def append_markdown(path, story, styles, figure_map, used, doc_width):
    lines = path.read_text(encoding="utf-8").splitlines()
    table_lines = []
    code_lines = []
    in_code = False

    def flush_table():
        nonlocal table_lines
        if table_lines:
            story.extend(parse_table(table_lines, styles, doc_width))
            table_lines = []

    def flush_code():
        nonlocal code_lines
        if code_lines:
            wrapped = []
            for line in code_lines:
                wrapped.extend(textwrap.wrap(line, width=96, replace_whitespace=False) or [""])
            story.append(Preformatted("\n".join(wrapped), styles["Code"]))
            story.append(Spacer(1, 8))
            code_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            flush_table()
            if in_code:
                in_code = False
                flush_code()
            else:
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue
        if stripped.startswith("|") and stripped.endswith("|"):
            table_lines.append(line)
            continue
        flush_table()
        if not stripped:
            story.append(Spacer(1, 5))
            continue
        heading = re.match(r"^(#{1,4})\s+(.+)$", stripped)
        if heading:
            level = len(heading.group(1))
            text = inline_markup(heading.group(2))
            if level == 1 and story:
                story.append(PageBreak())
            story.append(Paragraph(text, styles[f"H{min(level, 3)}"]))
        elif stripped.startswith("- "):
            story.append(Paragraph("- " + inline_markup(stripped[2:]), styles["Bullet"]))
        elif re.match(r"^\d+\.\s+", stripped):
            story.append(Paragraph(inline_markup(stripped), styles["Body"]))
        else:
            story.append(Paragraph(inline_markup(stripped), styles["Body"]))
        for figure in extract_figures(stripped):
            if figure in figure_map:
                used.add(figure)
                caption = f"Figura: {figure}"
                story.extend(figure_flowables(figure_map[figure], caption, styles, doc_width, 5.5 * inch))
    flush_table()
    flush_code()


def make_styles():
    base = getSampleStyleSheet()
    return {
        "Title": ParagraphStyle("Title", parent=base["Title"], fontName=PDF_FONTS["bold"], fontSize=14, leading=21, textColor=colors.black, alignment=1, spaceAfter=12),
        "Subtitle": ParagraphStyle("Subtitle", parent=base["BodyText"], fontName=PDF_FONTS["normal"], fontSize=13, leading=19.5, textColor=colors.black, alignment=1, spaceAfter=12),
        "TOCTitle": ParagraphStyle("TOCTitle", parent=base["Heading1"], fontName=PDF_FONTS["bold"], fontSize=14, leading=21, textColor=colors.black, alignment=1, spaceBefore=4, spaceAfter=12),
        "H1": ParagraphStyle("H1", parent=base["Heading1"], fontName=PDF_FONTS["bold"], fontSize=14, leading=21, textColor=colors.black, spaceBefore=4, spaceAfter=8),
        "H2": ParagraphStyle("H2", parent=base["Heading2"], fontName=PDF_FONTS["bold"], fontSize=13, leading=19.5, textColor=colors.black, spaceBefore=9, spaceAfter=6),
        "H3": ParagraphStyle("H3", parent=base["Heading3"], fontName=PDF_FONTS["bold"], fontSize=13, leading=19.5, textColor=colors.black, spaceBefore=8, spaceAfter=4),
        "Body": ParagraphStyle("Body", parent=base["BodyText"], fontName=PDF_FONTS["normal"], fontSize=12, leading=18, textColor=colors.black, spaceAfter=4),
        "Bullet": ParagraphStyle("Bullet", parent=base["BodyText"], fontName=PDF_FONTS["normal"], leftIndent=18, firstLineIndent=-12, fontSize=12, leading=18, textColor=colors.black, spaceAfter=3),
        "TableHead": ParagraphStyle("TableHead", parent=base["BodyText"], fontName=PDF_FONTS["bold"], fontSize=8.5, leading=12.75, textColor=colors.black),
        "TableCell": ParagraphStyle("TableCell", parent=base["BodyText"], fontName=PDF_FONTS["normal"], fontSize=8.5, leading=12.75, textColor=colors.black),
        "Code": ParagraphStyle("Code", parent=base["Code"], fontName="Courier", fontSize=8.5, leading=12.75, textColor=colors.black, leftIndent=8, rightIndent=8, backColor=colors.white, borderColor=colors.black, borderWidth=0.35, borderPadding=6, spaceAfter=8),
        "Caption": ParagraphStyle("Caption", parent=base["BodyText"], fontName=PDF_FONTS["bold"], fontSize=12, leading=18, textColor=colors.black, alignment=1),
        "TOC1": ParagraphStyle("TOC1", parent=base["BodyText"], fontName=PDF_FONTS["normal"], fontSize=12, leading=18, leftIndent=0, firstLineIndent=0, textColor=colors.black),
        "TOC2": ParagraphStyle("TOC2", parent=base["BodyText"], fontName=PDF_FONTS["normal"], fontSize=12, leading=18, leftIndent=18, firstLineIndent=0, textColor=colors.black),
        "TOC3": ParagraphStyle("TOC3", parent=base["BodyText"], fontName=PDF_FONTS["normal"], fontSize=12, leading=18, leftIndent=36, firstLineIndent=0, textColor=colors.black),
    }


def on_page(canvas, doc):
    canvas.saveState()
    canvas.setFont(PDF_FONTS["normal"], 9)
    canvas.setFillColor(colors.black)
    canvas.drawString(0.75 * inch, 0.45 * inch, "iMedExp Backend - Documentacion tecnica")
    canvas.drawCentredString(letter[0] / 2, 0.45 * inch, f"Documentador: {DOCUMENTADOR}")
    canvas.drawRightString(letter[0] - 0.75 * inch, 0.45 * inch, str(doc.page))
    canvas.restoreState()


def build_pdf(output):
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    register_pdf_fonts()
    figures = generate_figures()
    styles = make_styles()
    doc = FormalDocTemplate(
        str(output),
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        title="Documentacion Tecnica iMedExp Backend",
        author=DOCUMENTADOR,
    )
    toc = TableOfContents()
    toc.levelStyles = [styles["TOC1"], styles["TOC2"], styles["TOC3"]]
    story = [
        Spacer(1, 1.15 * inch),
        Paragraph("Documentacion Tecnica del Sistema iMedExp Backend", styles["Title"]),
        Spacer(1, 0.25 * inch),
        Paragraph(f"Documentador: {DOCUMENTADOR}", styles["Subtitle"]),
        Paragraph(f"Fecha de generacion: {date.today().isoformat()}", styles["Subtitle"]),
        PageBreak(),
        Paragraph("Indice", styles["TOCTitle"]),
        toc,
        PageBreak(),
        Paragraph("Indice de documentos fuente", styles["TOCTitle"]),
    ]
    rows = [[Paragraph("Documento", styles["TableHead"]), Paragraph("Archivo fuente", styles["TableHead"])]]
    for item in DOC_FILES:
        rows.append([Paragraph(inline_markup(item.stem), styles["TableCell"]), Paragraph(inline_markup(str(item.relative_to(PROJECT_DIR)).replace("\\", "/")), styles["TableCell"])])
    table = Table(rows, colWidths=[doc.width * 0.45, doc.width * 0.55])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
        ("FONTNAME", (0, 0), (-1, 0), PDF_FONTS["bold"]),
        ("FONTNAME", (0, 1), (-1, -1), PDF_FONTS["normal"]),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("LEADING", (0, 0), (-1, -1), 12.75),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.black),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("PADDING", (0, 0), (-1, -1), 5),
    ]))
    story.append(table)
    used = set()
    for source in DOC_FILES:
        append_markdown(source, story, styles, figures, used, doc.width)
    remaining = [name for name in sorted(figures) if name not in used]
    if remaining:
        story.append(PageBreak())
        story.append(Paragraph("Apendice de figuras", styles["H1"]))
        for name in remaining:
            story.extend(figure_flowables(figures[name], f"Figura: {name}", styles, doc.width, 5.5 * inch))
    doc.multiBuild(story, onFirstPage=on_page, onLaterPages=on_page)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=str(DIST_DIR / "imedexp-backend-documentacion-tecnica.pdf"))
    args = parser.parse_args()
    output = Path(args.output)
    if not output.is_absolute():
        output = PROJECT_DIR / output
    output.parent.mkdir(parents=True, exist_ok=True)
    build_pdf(output)
    print(output)


if __name__ == "__main__":
    main()
