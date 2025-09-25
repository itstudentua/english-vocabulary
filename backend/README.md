Run local DB

```sh
docker run --name english_voc_docker -e POSTGRES_USER=name -e POSTGRES_PASSWORD=pass -e POSTGRES_DB=english_voc -p 5432:5432 -v "$(pwd)/postgres_db:/var/lib/postgresql/data" -d postgres
```