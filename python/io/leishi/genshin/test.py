import proto


def main():
    build = proto.Build(
        name="test",
        character=proto.Character.HU_TAO,
        weapons=[proto.Weapon.WASTER_GREATSWORD],
        suits=[
            proto.Suit(set_combos=[proto.SetCombo(set=proto.Set.BERSERKER, count=4)])
        ],
        flower_attributes=[proto.AttributeType.ATK_PERCENT],
        plume_attributes=[proto.AttributeType.ATK_PERCENT],
        sands_attributes=[proto.AttributeType.ATK_PERCENT],
        goblet_attributes=[proto.AttributeType.ATK_PERCENT],
        circlet_attributes=[proto.AttributeType.ATK_PERCENT],
        sub_attributes=[
            proto.Attribute(type=proto.AttributeType.ATK_PERCENT, value=0.46)
        ],
    )
    h = build.__bytes__().hex()
    print(build.__bytes__().hex())
    b = proto.Build().parse(bytes.fromhex(h))
    print(b.__bytes__().hex())
    print(proto.Build().parse(bytes.fromhex('0a06e68aa4e691a910131a00220c0a04080610020a04082010022a01013201023a01064201134a010a52070807150000803f52070806150000803f52070804150000803f52070809150000803f5207080a150000803f')).to_json(indent=4))


if __name__ == "__main__":
    main()
