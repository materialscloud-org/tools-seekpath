import logging
import flask
from flask import Blueprint
import os

from compute.seekpath_web_module import process_structure_core, FlaskRedirectException
import compute.seekpath, compute.seekpath.hpkot, compute.seekpath.brillouinzone, compute.seekpath.brillouinzone.brillouinzone
from compute.seekpath.hpkot import SymmetryDetectionError


blueprint = Blueprint('compute', __name__, url_prefix='/compute')

logger = logging.getLogger('tools-app')

valid_examples = {
    "aP2_inv": ("aP2", True),
    "aP3_inv": ("aP3", True),
    "cF1_inv": ("cF1", True),
    "cF2_inv": ("cF2", True),
    "cI1_inv": ("cI1", True),
    "cP1_inv": ("cP1", True),
    "cP2_inv": ("cP2", True),
    "hP1_inv": ("hP1", True),
    "hP2_inv": ("hP2", True),
    "hR1_inv": ("hR1", True),
    "hR2_inv": ("hR2", True),
    "mC1_inv": ("mC1", True),
    "mC2_inv": ("mC2", True),
    "mC3_inv": ("mC3", True),
    "mP1_inv": ("mP1", True),
    "oC1_inv": ("oC1", True),
    "oC2_inv": ("oC2", True),
    "oF1_inv": ("oF1", True),
    "oF3_inv": ("oF3", True),
    "oI1_inv": ("oI1", True),
    "oI2_inv": ("oI2", True),
    "oI3_inv": ("oI3", True),
    "oP1_inv": ("oP1", True),
    "tI1_inv": ("tI1", True),
    "tI2_inv": ("tI2", True),
    "tP1_inv": ("tP1", True),
    "aP2_noinv": ("aP2", False),
    "aP3_noinv": ("aP3", False),
    "cF1_noinv": ("cF1", False),
    "cF2_noinv": ("cF2", False),
    "cI1_noinv": ("cI1", False),
    "cP1_noinv": ("cP1", False),
    "cP2_noinv": ("cP2", False),
    "hP1_noinv": ("hP1", False),
    "hP2_noinv": ("hP2", False),
    "hR1_noinv": ("hR1", False),
    "hR2_noinv": ("hR2", False),
    "mC1_noinv": ("mC1", False),
    "mC2_noinv": ("mC2", False),
    "mC3_noinv": ("mC3", False),
    "mP1_noinv": ("mP1", False),
    "oA1_noinv": ("oA1", False),
    "oA2_noinv": ("oA2", False),
    "oC1_noinv": ("oC1", False),
    "oC2_noinv": ("oC2", False),
    "oF1_noinv": ("oF1", False),
    "oF2_noinv": ("oF2", False),
    "oF3_noinv": ("oF3", False),
    "oI1_noinv": ("oI1", False),
    "oI2_noinv": ("oI2", False),
    "oI3_noinv": ("oI3", False),
    "oP1_noinv": ("oP1", False),
    "tI1_noinv": ("tI1", False),
    "tI2_noinv": ("tI2", False),
    "tP1_noinv": ("tP1", False),
}

@blueprint.route('/process_structure/', methods=['GET', 'POST'])
def process_structure():
    if flask.request.method == 'POST':
        structurefile = flask.request.files['structurefile']
        fileformat = flask.request.form.get('fileformat', 'unknown')
        filecontent = structurefile.read().decode('utf-8')

        try:
            return "FORMAT: {}<br>CONTENT:<br><code><pre>{}</pre></code>".format(fileformat, filecontent)
        #except FlaskRedirectException as e:
            #flask.flash(str(e))
            #return flask.redirect(flask.url_for('input_data'))
        except Exception:
            flask.flash("Unable to process the data, sorry...")
            return flask.redirect(flask.url_for('input_data'))

    else:
        return flask.redirect(flask.url_for('compute.process_structure_example'))
        #flask.flash("Redirecting...")
        #return flask.redirect(flask.url_for('input_data'))

@blueprint.route('/process_example_structure/', methods=['GET', 'POST'])
def process_structure_example():
    if flask.request.method == 'POST':
        examplestructure = flask.request.form.get('examplestructure', '<none>')
        fileformat = "vasp-ase"

        try:
            ext_bravais, withinv = valid_examples[examplestructure]
        except KeyError:
            flask.flash(
                "Invalid example structure '{}'".format(examplestructure))
            return flask.redirect(flask.url_for('input_data'))

        poscarfile = "POSCAR_inversion" if withinv else "POSCAR_noinversion"

        # I expect that the valid_examples dictionary already filters only
        # existing files, so I don't try/except here
        with open(
                os.path.join(
                    os.path.split(seekpath.__file__)[0], 'hpkot',
                    'band_path_data', ext_bravais,
                    poscarfile)) as structurefile:
            filecontent = structurefile.read()

        try:
            data_for_template = process_structure_core(
                filecontent=filecontent,
                fileformat=fileformat,
                seekpath_module=seekpath,
                call_source="process_example_structure[{}]".format(
                    examplestructure),
                logger=logger,
                flask_request=flask.request)
            return flask.render_template("user_templates/visualizer.html", **data_for_template)
        except FlaskRedirectException as e:
            flask.flash(str(e))
            return flask.redirect(flask.url_for('input_data'))
    else:
        return flask.redirect(flask.url_for('input_data'))