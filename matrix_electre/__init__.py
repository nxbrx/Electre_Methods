"""J-ELECTRE matrix computation package (Python port)."""

from matrix_electre.concordance import Concordance
from matrix_electre.credibility import Credibility
from matrix_electre.discordance import Discordance
from matrix_electre.electre_i import ELECTRE_I
from matrix_electre.electre_i_s import ELECTRE_I_s
from matrix_electre.electre_i_v import ELECTRE_I_v
from matrix_electre.electre_ii import ELECTRE_II
from matrix_electre.electre_iii import ELECTRE_III
from matrix_electre.electre_iv import ELECTRE_IV
from matrix_electre.electre_tri import ELECTRE_Tri
try:
    from matrix_electre.excel_adapter import ExcelAdapter
except Exception:
    ExcelAdapter = None
from matrix_electre.matrix_operations import MatrixOperations
from matrix_electre.ranking import Ranking

__all__ = [
    "Concordance",
    "Credibility",
    "Discordance",
    "ELECTRE_I",
    "ELECTRE_I_s",
    "ELECTRE_I_v",
    "ELECTRE_II",
    "ELECTRE_III",
    "ELECTRE_IV",
    "ELECTRE_Tri",
    "ExcelAdapter",
    "MatrixOperations",
    "Ranking",
]
