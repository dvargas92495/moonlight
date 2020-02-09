terraform {
    backend "remote" {
        hostname = "app.terraform.io"
        organization = "Moonlight"
        workspaces {
            prefix = "terraform-"
        }
    }
}
