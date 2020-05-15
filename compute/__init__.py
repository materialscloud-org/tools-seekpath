#!/usr/bin/env python
"""
Main Flask python function that manages the server backend.
"""
import logging
import flask
from flask import Blueprint
import os

import seekpath
import seekpath.hpkot
import seekpath.brillouinzone
import seekpath.brillouinzone.brillouinzone
from seekpath.hpkot import SymmetryDetectionError

from compute.seekpath_web_module import FlaskRedirectException, process_structure_core
from tools_barebone import get_style_version  # pylint: disable=import-error

view_folder = os.path.join(os.path.split(os.path.realpath(__file__))[0], os.pardir, 'user_views')


def get_visualizer_template(request):
    if get_style_version(request) == 'lite':
        return 'user_templates/visualizer_lite.html'
    return 'user_templates/visualizer.html'


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
    """
    Process a structure (uploaded from POST request)
    """
    if flask.request.method == 'POST':
        # check if the post request has the file part
        if 'structurefile' not in flask.request.files:
            return flask.redirect(flask.url_for('input_data'))
        structurefile = flask.request.files['structurefile']
        fileformat = flask.request.form.get('fileformat', 'unknown')
        filecontent = structurefile.read().decode('utf-8')

        try:
            data_for_template = process_structure_core(
                filecontent=filecontent,
                fileformat=fileformat,
                seekpath_module=seekpath,
                call_source="process_structure",
                logger=logger,
                flask_request=flask.request)
            return flask.render_template(get_visualizer_template(flask.request),
                                         **data_for_template)
        except FlaskRedirectException as e:
            flask.flash(str(e))
            return flask.redirect(flask.url_for('input_data'))
        except SymmetryDetectionError:
            flask.flash("Unable to detect symmetry... "
                        "Maybe you have overlapping atoms?")
            return flask.redirect(flask.url_for('input_data'))
        except Exception:
            flask.flash("Unable to process the structure, sorry...")
            return flask.redirect(flask.url_for('input_data'))

    else:  # GET Request
        return flask.redirect(flask.url_for('input_data'))


@blueprint.route('/process_example_structure/', methods=['GET', 'POST'])
def process_example_structure():
    """
    Process an example structure (example name from POST request)
    """
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
            return flask.render_template(get_visualizer_template(flask.request),
                                         **data_for_template)
        except FlaskRedirectException as e:
            flask.flash(str(e))
            return flask.redirect(flask.url_for('input_data'))

    else:  # GET Request
        return flask.redirect(flask.url_for('input_data'))


@blueprint.route('/bravaissymbol_explanation/')
def bravaissymbol_explanation():
    """
    View for the explanation of the Bravais symbol
    """
    return flask.send_from_directory(view_folder,
                                     'bravaissymbol_explanation.html')

@blueprint.route('/termsofuse/')
def termsofuse():
    """
    View for the terms of use
    """
    return flask.send_from_directory(view_folder, 'termsofuse.html')
