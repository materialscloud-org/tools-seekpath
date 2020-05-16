FROM tools-barebone

LABEL maintainer="Giovanni Pizzi <giovanni.pizzi@epfl.ch>"

# Python requirements
COPY ./requirements.txt /home/app/code/requirements.txt
# Run this as sudo to replace the version of pip
RUN pip3 install -U 'pip>=10' setuptools wheel
# install packages as normal user (app, provided by passenger)
USER app
WORKDIR /home/app/code
# Install pinned versions of packages
RUN pip3 install --user --pre -r requirements.txt
# Go back to root.
# Also, it should remain as user root for startup
USER root

# Copy various files
COPY ./config.yaml /home/app/code/webservice/static/config.yaml
COPY ./user_templates/ /home/app/code/webservice/templates/user_templates/
COPY ./compute/ /home/app/code/webservice/compute/
COPY ./user_static/ /home/app/code/webservice/user_static/
COPY ./user_views/ /home/app/code/webservice/user_views/

# Set proper permissions on files just copied
RUN chown -R app:app /home/app/code/webservice/


