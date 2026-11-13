import { useCallback, useRef, useState } from "react";
import { requestStudySet } from "../api";

export function useStudySet() {
  const [state, setState] = useState({ status: "idle", data: null, error: null });
  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const lastTextRef = useRef("");

  const generate = useCallback(async (text) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const id = ++requestIdRef.current;
    lastTextRef.current = text;

    setState({ status: "loading", data: null, error: null });
    try {
      const data = await requestStudySet(text, controller.signal);
      if (id !== requestIdRef.current) return;
      setState({ status: "success", data, error: null });
    } catch (err) {
      if (err.name === "AbortError" || id !== requestIdRef.current) return;
      setState({ status: "error", data: null, error: err.message });
    }
  }, []);

  const retry = useCallback(() => {
    if (lastTextRef.current) generate(lastTextRef.current);
  }, [generate]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    requestIdRef.current++;
    setState({ status: "idle", data: null, error: null });
  }, []);

  return { ...state, generate, retry, cancel };
}