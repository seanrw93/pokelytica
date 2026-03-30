import { useEffect } from "react";

type UseScrollIntoViewProps = {
    targetRef: React.RefObject<HTMLElement | null>,
    deps: React.DependencyList 
}

export const useScrollIntoView = ({
    targetRef,
    deps
}: UseScrollIntoViewProps) => {
    useEffect(() => {
        if (!deps || !targetRef.current) return;

        targetRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, deps);
}
