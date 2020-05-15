##############
tools-seekpath
##############

In this repository we provide the code to deploy an online service for 
the visualization of the band paths and primitive cells of the crystal 
structures. A live demo is currently hosted on the `Materials Cloud`_ web portal.

This tool leverages `seekpath`_, a python module to obtain and visualize band
paths in the Brillouin zone of crystal structures. 
The definition of k-point labels follows crystallographic convention, as defined
and discussed in the `HPKOT paper`_. Moreover, the Bravais lattice is detected
properly using the spacegroup symmetry. Also the suggested band path provided
in the `HPKOT paper`_ is returned.
Systems without time-reversal and inversion-symmetry are also properly 
taken into account.

.. contents::

.. section-numbering::

===========
How to cite
===========
If you use this tool, please cite the following work:

- Y. Hinuma, G. Pizzi, Y. Kumagai, F. Oba, I. Tanaka, *Band structure diagram 
  paths based on crystallography*, Comp. Mat. Sci. 128, 140 (2017)
  (`JOURNAL LINK`_, `arXiv link`_).
- You should also cite `spglib`_ that is an essential library used in the 
  implementation.

============
Contributors
============
- Tiziano Müller (UZH, Switzerland) for the CP2K input file generator
  and added a number of new input formats (XYZ, PDB, ...)
- Hung Pham (University of Minnesota, USA) for the CRYSTAL and VASP input file generators

=======
License
=======

The code is open-source (licensed with a MIT license, see LICENSE.txt).

===================
Online service/tool
===================

The following is a screenshot of the selection window:

.. image:: https://raw.githubusercontent.com/materialscloud-org/tools-seekpath/master/misc/screenshots/selector.png
     :alt: SeeK-path web service selection window
     :width: 50%
     :align: center

And the following is a screenshot of the main output window, showing the Brillouin zone, the primitive crystal structure, the coordinates of the k-points and the suggested band path.

.. image:: https://raw.githubusercontent.com/materialscloud-org/tools-seekpath/master/misc/screenshots/mainwindow.png
     :alt: SeeK-path web service main output
     :width: 50%
     :align: center

=========================================
Docker image and running the tool locally
=========================================
Docker images are automatically built and hosted on `DockerHub under the repository materialscloud/tools-seekpath`_.

If you want to run locally the latest version, you can execute::

  docker run -p 8092:80 materialscloud/tools-seekpath

and then connect to ``http://localhost:8092`` with your browser.

.. _HPKOT paper: http://dx.doi.org/10.1016/j.commatsci.2016.10.015
.. _JOURNAL LINK: http://dx.doi.org/10.1016/j.commatsci.2016.10.015
.. _arXiv link: https://arxiv.org/abs/1602.06402
.. _spglib: http://atztogo.github.io/spglib/
.. _Materials Cloud: http://www.materialscloud.org/tools/seekpath/
.. _seekpath: http://www.github.com/giovannipizzi/seekpath/
.. _DockerHub under the repository materialscloud/tools-seekpath: https://hub.docker.com/repository/docker/materialscloud/tools-seekpath