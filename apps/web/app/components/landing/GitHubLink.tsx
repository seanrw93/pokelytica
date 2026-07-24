import { BsGithub } from "react-icons/bs";

export const GitHubLink = () => {
    return (
        <div className="absolute top-4 right-4 text-sm">
            <a href="https://github.com/seanrw93/pokelytica" className="text-muted hover:text-foreground transition-colors" aria-label="View source on GitHub">
                <BsGithub className="w-4 h-4" />
            </a>
        </div>
    )
}
