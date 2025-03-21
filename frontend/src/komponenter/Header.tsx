import { LeaveIcon } from "@navikt/aksel-icons";
import { Dropdown } from "@navikt/ds-react/Dropdown";
import { InternalHeader } from "@navikt/ds-react/InternalHeader";
import { Spacer } from "@navikt/ds-react/Stack";
import { BodyShort } from "@navikt/ds-react/Typography";
import { useAuth } from "../hooks/useAuth";
import { EnterIcon } from "@navikt/aksel-icons";

export const Header = () => {
  const { bruker, loggInn, loggUt } = useAuth();

  return (
    <header>
      <InternalHeader>
        <InternalHeader.Title as="h1">Burde forstått 🤔</InternalHeader.Title>
        <Spacer />
        <Dropdown defaultOpen>
          <InternalHeader.UserButton
            as={Dropdown.Toggle}
            name={bruker.navn ?? "Ikke logget inn"}
          />
          <Dropdown.Menu>
            {bruker.navn ? (
              <>
                <dl>
                  <BodyShort as="dt" size="small">
                    {bruker.navn}
                  </BodyShort>
                </dl>
                <Dropdown.Menu.Divider />
                <Dropdown.Menu.List>
                  <Dropdown.Menu.List.Item onClick={loggUt}>
                    Logg ut <Spacer />{" "}
                    <LeaveIcon aria-hidden fontSize="1.5rem" />
                  </Dropdown.Menu.List.Item>
                </Dropdown.Menu.List>
              </>
            ) : (
              <>
                <Dropdown.Menu.List>
                  <Dropdown.Menu.List.Item onClick={loggInn}>
                    Logg inn <Spacer />{" "}
                    <EnterIcon aria-hidden fontSize="1.5rem" />
                  </Dropdown.Menu.List.Item>
                </Dropdown.Menu.List>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </InternalHeader>
    </header>
  );
};
