import json
import os

import pytest

from selenium.webdriver.support.ui import Select
from urllib.parse import urlparse

# Note: you need to build docker and start it with
# ./admin-tools/build-docker.sh && ./admin-tools/run-docker.sh
# Then, you can run the tests (e.g. with )
TEST_URL = "http://localhost:8092"
STRUCTURE_EXAMPLES_PATH = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "structure_examples"
)


@pytest.mark.nondestructive
def test_barebone_input_data_page(selenium):
    """Check the page that is shown by default when there is no configuration."""
    selenium.get(TEST_URL)

    assert "seek-path" in selenium.title.lower()
    format_selector = selenium.find_element_by_id("fileformatSelect")

    # This is not a complete list, but at least these should be present
    expected_importer_names = set(
        [
            "Quantum ESPRESSO input [parser: qe-tools]",
            "VASP POSCAR [parser: ase]",
            "XCrySDen (.xsf) [parser: ase]",
            "CIF File (.cif) [parser: pymatgen]",
            "XYZ File (.xyz) [parser: ase]",
        ]
    )

    # If the difference is not empty, at least one of the expected importer names is not there!
    assert not expected_importer_names.difference(
        option.text for option in format_selector.find_elements_by_tag_name("option")
    )

    # Check the presence of a string in the source code
    assert "Pizzi" in selenium.page_source


def get_file_examples():
    """Get all valid files from the STRUCTURE_EXAMPLES_PATH and returns
    a list of tuples in the format (parser_name, file_relpath)."""
    retval = []
    top_dir = STRUCTURE_EXAMPLES_PATH
    for parser_name in os.listdir(top_dir):
        parser_dir = os.path.join(top_dir, parser_name)
        if not os.path.isdir(parser_dir):
            continue
        for filename in os.listdir(parser_dir):
            if filename.endswith("~") or filename.startswith("."):
                continue
            retval.append((parser_name, filename))

    return retval


def submit_structure(selenium, file_abspath, parser_name):
    """Given a selenium driver, submit a file."""
    # Load file
    file_upload = selenium.find_element_by_name("structurefile")
    file_upload.send_keys(file_abspath)

    # Select format
    format_selector = selenium.find_element_by_id("fileformatSelect")
    Select(format_selector).select_by_value(parser_name)

    # Check if there is additional extra information to put in the form
    # If there, it's in a file named .extra.XXX for a XXX file_path.
    # It is a JSON where the key is the 'name' of the input field, and the
    # value is the value to type in.
    # In this case type it in the right input form.
    extra_file = os.path.join(
        os.path.dirname(file_abspath),
        ".extra.{}".format(os.path.basename(file_abspath)),
    )
    if os.path.isfile(extra_file):
        with open(extra_file) as fhandle:
            extra_data = json.load(fhandle)
        for extra_name, extra_value in extra_data.items():
            selenium.find_element_by_xpath(
                "//input[@name='{}']".format(extra_name)
            ).send_keys(str(extra_value))

    # Submit form
    # selenium.find_element_by_xpath("//input[@value='Calculate my structure']").click()
    selenium.find_element_by_xpath(
        "//form[@action='compute/process_structure/']"
    ).submit()


@pytest.mark.nondestructive
@pytest.mark.parametrize("parser_name, file_relpath", get_file_examples())
def test_send_structure(selenium, parser_name, file_relpath):
    """Test submitting various files."""
    selenium.get(TEST_URL)

    # Load file
    file_abspath = os.path.join(STRUCTURE_EXAMPLES_PATH, parser_name, file_relpath)
    submit_structure(selenium, file_abspath, parser_name)

    # We should have been redirected back to /
    assert urlparse(selenium.current_url).path == "/compute/process_structure/"

    assert "Primitive" in selenium.page_source
