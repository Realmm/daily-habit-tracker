import React, {
  FormEvent,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { AiOutlineClose } from "react-icons/ai";

type PopupProps = {
  invalidRefs: MutableRefObject<null>[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  open: boolean;
  close: () => void;
  title: string;
  fields: Field[];
  submitText: string;
};

type Field = {
  placeholder: string;
  title: string;
  id: string;
};

const isInside = (e: MouseEvent, rect: any): boolean => {
  const x = e.clientX;
  const y = e.clientY;
  if (rect === undefined) return false;
  return !(
    y <= rect.y ||
    y >= rect.y + rect.height ||
    x <= rect.x ||
    x >= rect.x + rect.width
  );
};

const Popup = (props: PopupProps) => {
  const popup = useRef(null);
  const formRef = useRef(null);

  const [fieldElements, setFieldElements] = useState<JSX.Element[]>();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      let invalid = false;
      props.invalidRefs.forEach((r) => {
        if (invalid) return;
        const inside = isInside(e, (r.current as any)?.getBoundingClientRect());
        invalid = inside;
      });
      if (invalid || props.invalidRefs.some((r) => r.current === e.target))
        return;
      const rect = (popup.current as any)?.getBoundingClientRect();
      if (!isInside(e, rect)) props.close();
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const elements = [];
    for (let i = 0; i < props.fields.length; i++) {
      const f = props.fields[i];
      elements.push(
        <FieldElement
          id={f.id}
          placeholder={f.placeholder}
          title={f.title}
          key={i}
        />
      );
    }
    setFieldElements(elements);
  }, [props.fields]);

  useEffect(() => {}, [fieldElements]);

  return (
    <>
      <div
        className={
          (props.open ? "" : "hidden ") +
          "absolute z-10 w-screen h-screen top-0 left-0 bg-black bg-opacity-40 flex sm:text-sm text-xs"
        }
      >
        <div className="mx-auto mt-28 w-full">
          <div
            ref={popup}
            className="bg-white rounded-lg w-1/2 mx-auto shadow-2xl"
          >
            <form
              ref={formRef}
              className="inline-block mb-10 w-full"
              onSubmit={async (e) => {
                props.close();
                e.preventDefault();
                props.onSubmit(e);
                (formRef.current as any)?.reset();
              }}
            >
              <div className="sm:text-base text-xs flex w-full justify-between p-4 mb-4">
                <span className="pl-4 py-2 w-3/4">{props.title}</span>
                <button onClick={() => props.close()} type="button" className="my-auto mr-4">
                  <AiOutlineClose />
                </button>
              </div>
              <div className="flex justify-center mx-4 px-4">
                <div className="inline-block w-full">
                  {fieldElements}
                  <div className={(fieldElements === undefined || fieldElements.length === 0 ? "" : "mt-10 ") + "text-white bg-gray-900 px-4 py-2 w-max mt- rounded-md"}>
                    <button type="submit">{props.submitText}</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

const FieldElement = (field: Field) => {
  return (
    <>
      <div className="mb-2">
        <span className="text-red-500">* </span>
        <span>{field.title}</span>
      </div>
      <div className="border-2 border-gray-300 rounded-md">
        <input
          className="w-full py-1 px-2"
          type={field.id}
          id={field.id}
          placeholder={field.placeholder}
          required={true}
        />
      </div>
    </>
  );
};

export default Popup;
