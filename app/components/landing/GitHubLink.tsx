import { BsGithub } from "react-icons/bs";

export const GitHubLink = () => {
    return (
        <div className="absolute top-4 right-4 text-sm">
            <a href="https://github.com/seanrw93/pokelytica" className="text-[#7878a0] hover:text-white transition">
                <BsGithub />
            </a>
        </div>
    )
}