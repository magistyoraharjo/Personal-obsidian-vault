---
date: 2026-10-11
tags:
  - homelab
  - proxmox
  - docker
  - immich
---

# Timboel Office Server — Setup Notes

## Purpose

Set up a self-hosted photo server for family use with Immich.

Active ERPNext runs on a separate VPS and is unaffected by this setup.

## Proxmox host

- Address: https://192.168.0.130:8006
- Hostname changed from `pve` to `server-kantor-timboel`.
- Deleted both old VMs:
  - Timboel Docker Host
  - Windows Host
- Kept Proxmox and its storage.

Proxmox terminology:
- **Datacenter:** top-level management view.
- **Node:** physical server running Proxmox.
- **VM:** virtual computer with its own kernel.
- **CT:** LXC container sharing the Proxmox kernel; different from Docker.

Docker runs inside a Debian VM.

## Debian Docker VM

| Setting | Value |
|---|---|
| IP address | `192.168.0.181` |
| Username | `maple` |
| CPU | Believed to be 4 virtual cores; verify |
| RAM | 4 GB |
| Virtual disk | 500 allocated; likely GiB in Proxmox |
| Debian version | Not recorded |
| VM name | Not confirmed |

### Access

From the main PC:

~~~bash
magis-docker-host
~~~

This alias connects through SSH to the Docker VM.

Confirmed working:
- SSH login
- `sudo`
- Docker commands without `sudo`

The account belongs to the `sudo` and `docker` groups. Docker group membership grants root-equivalent control over the VM.

### IP address reservation — pending

The Tenda router requires the VM's MAC address to reserve its IP.

It is not confirmed whether `192.168.0.181` is static or reserved. It may change.

The relevant MAC address is the Debian VM's network adapter, visible in Proxmox under:

**VM → Hardware → Network Device**

## Docker installation

Installed using Docker's official Debian repository:

- Docker Engine: `docker-ce`
- Docker CLI: `docker-ce-cli`
- Container runtime: `containerd.io`
- Compose: `docker-compose-plugin`

Compose command:

~~~bash
docker compose
~~~

## Immich

- Status: running and accessible.
- Address: http://192.168.0.181:2283
- Compose directory: `/home/maple/immich`
- Installation uses the official release Compose file and environment template.
- No photos uploaded yet.
- Installed Immich version not recorded.

### Storage

Preference: keep original photos in an ordinary VM folder using a bind mount.

Relative paths were changed to absolute paths under `/home/maple/immich`.

Intended mappings:

| Setting | Path |
|---|---|
| `UPLOAD_LOCATION` | `/home/maple/immich/library` |
| `DB_DATA_LOCATION` | `/home/maple/immich/postgres` |

Exact saved values should be checked in `.env`.

Preserve the subfolder names: uploads and PostgreSQL must use separate directories.

The agreed model-cache setup was to retain Docker's managed volume. Its final configuration is not confirmed.

These folders reside inside the Debian VM's virtual disk.

### Photo filename template

Chosen template:

~~~handlebars
{{y}}-{{MM}}-{{dd}}_{{filename}}
~~~

Example:

~~~text
2026-10-11_IMG_2024.jpg
2026-10-11_DSC_0082.jpg
2026-10-12_IMG_2025.heic
~~~

Behavior:
- Date appears in the filename.
- No date-based subfolders.
- Immich retains separate base folders for each user.
- Filename collisions receive a sequence suffix.

With storage templates enabled, originals are stored beneath:

~~~text
UPLOAD_LOCATION/library/<user-ID-or-storage-label>/
~~~

With the intended upload path, this means:

~~~text
/home/maple/immich/library/library/<user-ID-or-storage-label>/
~~~

The repeated `library` is expected: the first is the chosen upload root; the second is Immich's internal folder.

No existing-photo migration is needed yet because nothing has been uploaded. Confirm the template is enabled and saved before uploading.

### Machine learning — unresolved

Machine-learning status is unknown.

During setup, a Compose override was provided to exclude the machine-learning container from default startup. Whether it was applied is unconfirmed.

Immich's documented requirements at setup:
- Full setup: minimum 6 GB RAM; 8 GB recommended.
- 4 GB can run with machine learning disabled.

Check both:
- Running containers with `docker compose ps`.
- **Administration → Settings → Machine Learning**.

## Pending setup

- [ ] Verify VM name, Debian version, CPU allocation, and disk size.
- [ ] Reserve `192.168.0.181` in the Tenda router using the VM's MAC address.
- [ ] Verify upload and database paths in `.env`.
- [ ] Confirm machine-learning configuration.
- [ ] Confirm storage template is enabled and saved.
- [ ] Configure phone uploads.
- [ ] Create wife's account.
- [ ] Configure photo sharing.
- [ ] Configure remote access.
- [ ] Configure a separate backup of photo files and the database.

Immich running on this server is not yet a complete backup system. Separate backup and recovery remain unconfigured.

## Useful commands

Run inside the Debian VM:

~~~bash
cd /home/maple/immich

# Show container status
docker compose ps

# View recent logs
docker compose logs --tail=100

# Start containers or apply configuration changes
docker compose up -d

# Check filesystem capacity
df -h /home/maple/immich
~~~

## References

- https://docs.docker.com/engine/install/debian/
- https://docs.immich.app/install/docker-compose/
- https://docs.immich.app/install/requirements/
- https://docs.immich.app/administration/storage-template/
- https://docs.immich.app/administration/backup-and-restore/